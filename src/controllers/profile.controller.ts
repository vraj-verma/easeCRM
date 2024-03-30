import {
     Controller,
     HttpException,
     HttpStatus,
     Patch,
     Post,
     Query,
     Req,
     Res,
     UploadedFiles,
     UseGuards,
     UseInterceptors
} from "@nestjs/common";
import {
     ApiOperation,
     ApiResponse,
     ApiTags
} from "@nestjs/swagger";
import {
     FileFieldsInterceptor
} from "@nestjs/platform-express";
import { Request, Response } from "express";
import { AuthUser } from "../types/authUser";
import { uploadOnLocal } from "../utils/multer";
import { JwtAuthGuard } from "../security/jwt.guard";
import { removeFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary";
import { ProfileService } from "../services/profile.service";
import { Exception } from "../errors/exception.error";
import { Profile } from "../schemas/profile.schema";

@ApiTags('Profile Controller')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
     constructor(
          private profileService: ProfileService
     ) { }

     @ApiOperation({ summary: 'Upload avatar' })
     @ApiResponse({ type: 'string' })
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

          const profile: Profile = {
               user_id: authUser._id,
               email: authUser.email,
               avatar: avatarUrl
          }

          await this.profileService.uploadAvatar(profile);

          res.status(200).json(
               {
                    message: "Avatar uploaded",
                    avatar: avatarUrl
               }
          );
     }


     @ApiOperation({ summary: 'Remove avatar' })
     @ApiResponse({ type: 'string' })
     @Patch('remove-avatar')
     async removeAvatar(
          @Req() req: Request,
          @Res() res: Response,
          @Query('image_url') image_url: string
     ) {

          if (!image_url) {
               throw new Exception('Please provide image url', HttpStatus.BAD_REQUEST)
          }

          const url = `avatar${image_url.split('avatar')[1].split('.')[0]}`;

          const cloudinary = await removeFromCloudinary(url);

          if (cloudinary.result !== 'ok') {
               throw new Exception(
                    `${cloudinary.result}`,
                    HttpStatus.NOT_FOUND
               );
          }

          await this.profileService.removeAvatar(image_url);

          res.status(200).json(
               {
                    message: 'Avatar removed successfully'
               }
          )
     }


}