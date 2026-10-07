import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file cloudinary
    const response = await cloudinary.uploader.upload(localFilePath,{
        resource_type:"auto"
    });
    //file had been uploaded successfull
    console.log("File is upload on cloudinary",response.url)
    
        fs.unlinkSync(localFilePath);
    
    return response;
  } catch (error) {
    console.log("Cloudinary upload error:", error);

    if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
    }

    return null;
}
};

export {uploadOnCloudinary}