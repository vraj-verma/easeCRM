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
import { AuthUser } from "../types/authUser";
import { uploadOnLocal } from "../utils/multer";
import { JwtAuthGuard } from "../security/jwt.guard";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { ProfileService } from "../services/profile.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";

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

          const authUser = <AuthUser>req.user;

          const file = files.avatar[0].path;

          if (!file) {
               throw new HttpException(
                    `Please upload a file`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const avatarUrl = await uploadOnCloudinary(file, 'avatar');

          if (!avatarUrl) {
               throw new HttpException(
                    `Something went wrong, file not uploaded to cloudinary`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const profile = {
               user_id: authUser._id,
               email: authUser.email,
               avatar: avatarUrl
          }

          await this.profileService.uploadAvatar(profile);

          res.status(200).json(
               {
                    message: "Avatar uploaded",
               }
          );
     }

}