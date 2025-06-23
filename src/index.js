import dotenv from "dotenv";
import DB_Connect from "./db/index.js";
import { app } from "./app.js";
dotenv.config({ path: "./env" });

DB_Connect()
  .then(() => {
    app.on("error", (error) => {
      console.error("Server error:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed:", error);
  });
