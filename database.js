require("dotenv").config();
const mongodb = require("mongodb"),
  util = require("util"),
  uri = process.env.MONGODB_URI,
  client = new mongodb.MongoClient(uri),
  multer = require("multer"),
  fs = require("fs"),
  crypto = require("crypto"),
  { GridFsStorage } = require("multer-gridfs-storage"),
  algorithm = "aes-256-cbc",
  symmetricDecrypt = (text) => {
    const key = fs.readFileSync("./cryptography/id_sym_key.pem", {
      encoding: "utf-8",
    });
    const [iv, encryptedText] = text
      .split(":")
      .map((part) => Buffer.from(part, "hex"));
    const decipher = crypto.createDecipheriv(
      algorithm,
      Buffer.from(key, "hex"),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  },
  { signMessage, verifyMessage } = require("./cryptography/index");

(async () => {
  await client.connect();
  const database = client.db("fcsproj"),
    users = client.db("fcsproj").collection("users"),
    uploads = new mongodb.GridFSBucket(database, { bucketName: "uploads" }),
    storage = new GridFsStorage({
      url: uri,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (req, file) => {
        return {
          bucketName: "uploads",
          filename: `${req.user._id.toString()}-${file.originalname}`,
        };
      },
    }),
    uploadFiles = multer({ storage }).array("file"),
    uploadFilesMiddleware = util.promisify(uploadFiles),
    upload = async (req, res) => {
      try {
        await uploadFilesMiddleware(req, res);
        const privKey = symmetricDecrypt(req.user.privKeyEnc);
        for (let i = 0; i < req.files.length; i++) {
          const signatureData = {
              id: req.files[i].id.toString(),
            },
            signature = signMessage(privKey, signatureData);
          await users.findOneAndUpdate(
            { _id: req.user._id },
            {
              $push: {
                files: {
                  origin: req.fileOrigin,
                  ...signature,
                  filename: req.files[i].filename,
                  owner: req.user._id.toString(),
                  email: req.user.email,
                },
              },
            }
          );
        }

        const newUserData = await users.findOne({ _id: req.user._id });

        return res.send({
          message: "File has been uploaded.",
          files: newUserData.files,
        });
      } catch (error) {
        console.log(error);
        return res.send({
          message: `Error when trying upload image: ${error}`,
        });
      }
    },
    getListFiles = async (req, res) => {
      try {
        const data = database.collection("uploads.files");
        const cursor = data.find({
          filename: {
            $in: req.user.files,
          },
        });

        if ((await cursor.count()) === 0) {
          return res.status(500).send({
            message: "No files found!",
          });
        }

        let fileInfos = [];
        await cursor.forEach((doc) => {
          fileInfos.push({
            name: doc.filename,
            url: "/fetch" + doc.filename,
          });
        });

        return res.status(200).send(fileInfos);
      } catch (error) {
        return res.status(500).send({
          message: error.message,
        });
      }
    },
    download = async (req, res) => {
      try {
        let downloadStream = uploads.openDownloadStream(
          new mongodb.ObjectId(req.params.id)
        );

        res.set({
          "Content-Disposition": 'attachment; filename="' + req.params.id + '"',
          "Content-Type": req.params.type,
        });

        downloadStream.on("data", function (data) {
          return res.status(200).write(data);
        });
        downloadStream.on("error", function (err) {
          return res.status(404).send({ message: "Cannot download the file!" });
        });
        downloadStream.on("end", () => {
          return res.end();
        });
      } catch (error) {
        return res.status(500).send({
          message: error.message,
        });
      }
    },
    verifyFile = async (req, res) => {
      const ownerOfFile = await users.findOne({
        _id: new mongodb.ObjectId(req.body.receivedFromId),
      });
      return res.status(200).send(
        verifyMessage(ownerOfFile.pubKey, {
          algorithm: req.body.algorithm,
          payload: req.body.payload,
          signature: req.body.signature,
        })
      );
    };

  await users.deleteMany({});
  const fileCursor = database.collection("uploads.files").find({});
  if ((await fileCursor.count()) !== 0) {
    await fileCursor.forEach((doc) => {
      uploads.delete(doc._id);
    });
  }

  module.exports.database = database;
  module.exports.users = users;
  module.exports.upload = upload;
  module.exports.getListFiles = getListFiles;
  module.exports.download = download;
  module.exports.verifyFile = verifyFile;
})();
