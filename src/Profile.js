import axios from "axios";
import FileSaver from "file-saver";
import React, { useContext, useState } from "react";
import { UserContext } from "./App";
import "./Profile.css";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Profile({ setPage }) {
  const [user, setUser] = useContext(UserContext);
  const [state, setState] = useState("");
  if (!user || !user.token) {
    setPage(1);
    return <></>;
  } else {
    const handleDownload = async (file) => {
      const res = await axios.get(`/fetch_files/${file.id}`, {
        headers: {
          Authorization: user.token.token,
        },
        responseType: "blob",
      });
      FileSaver.saveAs(res.data, file.filename);
    };

    const handleUpload = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      if (state.file) {
        for (let i = 0; i < state.file.length; i++) {
          formData.append("file", state.file[i]);
        }
      }

      if (state.file) {
        const { data } = await axios.post("/upload_files", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: user.token.token,
          },
        });

        setUser({ ...user, files: data.files });
        toast.success("Document uploaded Successfully!!", {position:"top-center"});
      }
    };

    const onShare = async (obj) => {
      obj.sendTo = state.share;
      await axios.post("/share", obj, {
        headers: {
          Authorization: user.token.token,
        },
      });

      toast.success("Document shared Successfully!!", {position:"top-center"});
    };

    const onChange = (e) => {
      if (e.target.name !== "file")
        setState({ ...state, [e.target.name]: e.target.value });
      else setState({ ...state, [e.target.name]: e.target.files });
    };

    return (
      <>
        <h2>User Details</h2>
        <div className="userDetail">
          <label style={{marginRight:"10px", fontWeight:"bold"}}>Email:</label>
          {user.email}
        </div>
        <div className="userDetail">
          <label style={{marginRight:"10px", fontWeight:"bold"}}>Type:</label>
          {user.type}
        </div>
        <div className="userDetail">
          <label style={{marginRight:"10px", fontWeight:"bold"}}>Kind:</label>
          {user.kind}
        </div>
        <div className="userDetail">
          <label style={{marginRight:"10px", fontWeight:"bold"}}>Verified:</label>
          {user.verified === true
            ? "Verified"
            : "Pending verification from admin"}
        </div>
        <hr />

        <h2>Share Documents</h2>
        <h4>Upload Document</h4>
        
        <div className="docDetail">
          <label htmlFor="share">Share with:</label>
          <input
            type="text"
            name="share"
            onChange={onChange}
            value={state.share}
            placeholder="Enter receiver email.."
          />
        </div>

        {user.files.map((obj) => {
          const file = obj.payload;
          return (
            <>
              <div className="userDetail">
                <label style={{marginRight:"10px", fontWeight:"bold"}}>File Id:</label>
                {file.id}
              </div>
              <div className="userDetail">
                <button
                  onClick={() => {
                    handleDownload(file);
                  }}
                >
                  Download
                </button>
                <button
                  onClick={() => {
                    onShare(obj);
                  }}
                >
                  Share
                </button>
              </div>
            </>
          );
        })}
        <form
          onSubmit={(e) => {
            handleUpload(e);
          }}
          method="POST"
          action="upload_files"
          encType="multipart/form-data"
          id="regForm"
        >
          <label htmlFor="file">Files: </label>
          <input
            type="file"
            id="file"
            name="file"
            multiple
            onChange={onChange}
          />
          <input type="submit" value="submit" />
        </form>
      </>
    );
  }
}