import * as joi from "joi";
import { Address } from "src/types/account";

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
}