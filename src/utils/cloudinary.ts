import { v2 as cloudinary } from "cloudinary"

cloudinary.config(
     {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true
     }
);

export const uploadOnCloudinary = async (localPath: string) => {
     if (!localPath) return null;
     try {
          const response = await cloudinary.uploader.upload(localPath);
          return response.url;
     } catch (e) {
          console.log(e);
     }
}