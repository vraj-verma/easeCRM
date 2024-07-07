import { v2 as cloudinary } from "cloudinary"

cloudinary.config(
     {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true
     }
);   

const uploadOnCloudinary = async (localPath: string, folder: string) => {
     if (!localPath) return null;
     try {
          const response = await cloudinary.uploader.upload(localPath, { folder });
          return response.url;
     } catch (e) {
          console.log(e);
     }
}

const removeFromCloudinary = async (image_url: string) => {
     if (!image_url) return null;
     try {
          return await cloudinary.uploader.destroy(image_url);
     } catch (e) {
          console.log(e);
     }
}

export {
     uploadOnCloudinary,
     removeFromCloudinary
}