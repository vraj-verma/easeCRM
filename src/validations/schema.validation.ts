import * as joi from "joi";
import { Address } from "src/types/account";
import { Role } from "src/types/authUser";

export class JoiValidationSchema {
     static signupSchema = joi.object({
          name: joi.string().min(2).optional().allow(null, ''),
          email: joi.string().email().required(),
          password: joi.string().min(6).max(200).required()
     });

     static accountUpdateSchema = joi.object({
          bio: joi.string().max(100).required(),
          address: joi.valid(...Object.values(Address)).optional().allow(null, ''),
     });

     static inviteUserSchema = joi.object({
          name: joi.string().min(2).max(20).required(),
          email: joi.string().email().required(),
          role: joi.string().valid(...Object.values(Role)).required(),
     });

     static joinUserSchema = joi.object({
          password: joi.string().min(6).max(200).required(),
          confirmPassword: joi.string().min(6).max(200).required()
     });
}