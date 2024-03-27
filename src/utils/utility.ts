import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { customAlphabet } from 'nanoid'

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

     testingEmails = ['sumitverma28004@gmail.com', 'vermavraj77@gmail.com', 'sumitvermamcale2023@bpibs.in'];


     generateJWTToken(payload: any) {
          if (!payload) return;

          return this.jwtService.sign(payload);
     }

     async verifyJWTToken(token: string) {
          return await this.jwtService.verify(token);
     }
}