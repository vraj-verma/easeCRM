import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
     constructor() {
          super({
               clientID: process.env.GOOGLE_CLIENT_ID,
               clientSecret: process.env.GOOGLE_CLIENT_SECRET,
               callbackURL: 'http://localhost:5000/v1/api/auth/google-redirect',
               scope: ['email', 'profile'],
          });
     }
     async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
          const { name, emails, photos } = profile;
          const user = {
               email: emails[0].value,
               name: name.givenName + name.familyName,
               avatar: photos[0].value,
               accessToken,
               refreshToken,
          };
          done(null, user);
     }
}