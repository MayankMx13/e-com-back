import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI;

const connection = async () => {
  try {
    await mongoose.connect(DATABASE_URI);
    console.log("Connection Established");
  } catch (error) {
    console.log("NOT ABLE TO CONNECT");
  }
};

export default connection;
