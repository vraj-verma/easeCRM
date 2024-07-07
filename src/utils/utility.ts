import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { customAlphabet } from 'nanoid'
import * as bcrypt from 'bcrypt';

@Injectable()
export class Utility {

     constructor(
          private jwtService: JwtService
     ) { }

     character = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

     randomNumber() {
          const nanoid = customAlphabet(this.character, 15);
          return nanoid();
     }

     generateJWTToken(payload: any) {
          try {
               if (!payload) return;

               return this.jwtService.sign(payload);
          } catch (error) {
               console.log(`Something went wrong:`, error);
               return;
          }
     }

     async verifyJWTToken(token: string) {
          try {
               return await this.jwtService.verify(token);
          } catch (error) {
               console.log(`Something went wrong:`, error);
               return;
          }
     }

     async encryptPassword(password: string) {
          try {
               const salt = await bcrypt.genSalt(7);
               const hash = bcrypt.hash(password, salt);
               return hash;
          } catch (error) {
               console.log(`Something went wrong:`, error);
               return;
          }
     }

     async decryptPassword(compareTo: string, compareWith: string) {
          try {
               return await bcrypt.compare(compareTo, compareWith);
          } catch (error) {
               console.log(`Something went wrong:`, error);
               return;
          }
     }

     testingEmails = ['sumitverma28004@gmail.com', 'vermavraj77@gmail.com', 'sumitvermamcale2023@bpibs.in'];
}