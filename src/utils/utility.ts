import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid'

@Injectable()
export class Utility {

     character = '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

     randomNumber() {
          const nanoid = customAlphabet(this.character, 15);
          return nanoid();
     }
}