import { Controller } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { ApiExcludeController, ApiTags } from "@nestjs/swagger";
const fs = require('fs');
const path = require('path');

@ApiTags('Cron Job Controller')
@ApiExcludeController()
@Controller()
export class CronJobController {

     @Cron('59 * * * * *')
     async removeFileFromPublicFolder() {

          const directoryPath = path.join(__dirname, '../../public/temp');

          try {
               fs.readdir(directoryPath, (err: any, files: string[]) => {
                    if (err) {
                         console.error('Error reading directory:', err);
                         return;
                    }

                    files.forEach((file: string) => {
                         const filePath = path.join(directoryPath, file);

                         fs.unlink(filePath, (err) => {
                              if (err) {
                                   console.error('Error deleting file:', err);
                                   return;
                              }
                              console.log('File deleted successfully:', filePath);
                         });
                    });
               });
          } catch (error) {
               console.error('Error deleting file:', error);
          }

          console.log('cron running and removing file, stored in public folder')
     }
}