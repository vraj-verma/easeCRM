import { Controller, Get } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
const fs = require('fs');
const path = require('path');

@Controller()
export class CronJobController {

     @Cron('59 * * * * *')
     @Get()
     async removeFileFromPublicFolder() {

          const directoryPath = path.join(__dirname, '../../public/temp');

          try {
               fs.readdir(directoryPath, (err, files) => {
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