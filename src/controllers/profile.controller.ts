import {
     Controller,
     HttpException,
     HttpStatus,
     Post,
     Req,
     Res,
     UploadedFiles,
     UseGuards,
     UseInterceptors
} from "@nestjs/common";
import { Request, Response } from "express";
import { uploadOnLocal } from "../utils/multer";
import { ProfileService } from "../services/profile.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { FileSizeValidationPipe } from "../pipes/fileSizeValidation.pipe";
import { uploadOnCloudinary } from "src/utils/cloudinary";
import { JwtAuthGuard } from "src/security/jwt.guard";
import { AuthUser } from "src/types/authUser";

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
     constructor(
          private profileService: ProfileService
     ) { }

     @Post('avatar')
     @UseInterceptors(
          FileFieldsInterceptor(
               [
                    { name: 'avatar', maxCount: 1 },

               ],
               uploadOnLocal
          ))
     async addAvatar(
          @Req() req: Request,
          @Res() res: Response,
          @UploadedFiles() files: { avatar?: Express.Multer.File[] }
     ) {

          const { email, _id } = <AuthUser>req.user;

          const file = files.avatar[0].path;

          if (!file) {
               throw new HttpException(
                    `Please upload a file`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const avatarUrl = await uploadOnCloudinary(file);

          if (!avatarUrl) {
               throw new HttpException(
                    `Something went wrong, file not uploaded to cloudinary`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const profile = {
               user_id: _id,
               email,
               avatar: avatarUrl
          }

          await this.profileService.uploadAvatar(profile);

          res.status(200).json({
               message: "Avatar uploaded",
               avatar: avatarUrl
          });

     }

}