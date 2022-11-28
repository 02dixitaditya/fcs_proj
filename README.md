# Steps:

1. First generate a self signed certificate and place it in cert folder.
2. run the genAndSaveKeygen function from crypotgraphy index.js file to generate key pair for jwt.
3. start mongodb database.
4. create an environment file .env and add mongoDB URI there as - MONGODB_URI=here
5. mongodb should have a database fcsproj
   1. A collection named users.
   2. create a user and add to the uri user details.
6. run npm install to install the packages.
7. run npm run build to build the react production bundle.
8. run node server.js to start the server. 
