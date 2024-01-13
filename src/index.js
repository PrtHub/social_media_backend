import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
.then(() => {
  app.on("error", (err) => {
    console.log(err);
    throw err
  })
  app.listen(process.env.PORT || 8000, () => {
    console.log("Server is running at:" + process.env.PORT)})
})
.catch((err) => {
   console.log("MONGODB connection failed: " + err)
})


/*
import express from "express";
const app = express();

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (err) => {
      console.log(err);
      throw err;
    });
    app.listen(process.env.PORT, () => {
      console.log(`{listening on port ${process.env.PORT}}`);
    });
  } catch (error) {
    console.error(error);
    throw new Error();
  }
})();

*/
