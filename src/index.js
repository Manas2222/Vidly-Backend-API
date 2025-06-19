import dotenv from "dotenv";
import DB_Connect from "./db/index.js";

dotenv.config({ path: "./env" });

DB_Connect();
