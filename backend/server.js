require("dotenv").config();
const express = require("express");
const app = express();
const uploadRouter = require("./API/routes/upload");
const cors = require("cors");
const morgan = require("morgan");
app.use(morgan("dev"));
app.use(cors());
app.use("/api/v1", uploadRouter);
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Upload MP3 File</title>
    </head>
    <body>
      <h1>Upload MP3 File</h1>
      <form action="/api/v1/upload" method="POST" enctype="multipart/form-data">
        <input type="file" name="audioFile" accept=".mp3">
        <button type="submit">Upload</button>
      </form>
    </body>
    </html>
  `);
});
app.listen(process.env.PORT, () => {
  console.log(`Server start on ${process.env.URL}:${process.env.PORT}`);
});
