import multer, { diskStorage } from "multer"
import { extname } from "path";

export const uploadOnLocal = {
     storage: diskStorage({
          destination: './public/temp',
          filename: (req, file, cb) => {
               const randomName = Date.now() + '-' + Math.round(Math.random() * 1E9);
               return cb(null, `${randomName}${extname(file.originalname)}`);
          },
     }),
}