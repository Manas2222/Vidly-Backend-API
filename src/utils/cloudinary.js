import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("File path is required");
    }
    // upload the file to cloudinary
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: auto,
    });
    console.log(
      "file has been uploaded on cloudinary successfully" + response.url
    );
    console.log(response);
    // file has been uploaded successfully, now we need to remove it from the server
    return response;
  } catch (error) {
    // remove the locally saved temporary file, since the upload failed to cloudinary
    fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadOnCloudinary };
