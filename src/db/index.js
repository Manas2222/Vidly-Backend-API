import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const DB_Connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `MongoDB connected successfully: DB_HOST - ${connectionInstance.connection.host}`
    );
    console.log(`Connection Instance Object: ${connectionInstance.connection}`);
  } catch (error) {
    console.error("MongoDB connection FAILURE:", error);
    process.exit(1);
  }
};

export default DB_Connect;
