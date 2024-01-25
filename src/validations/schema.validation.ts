import * as joi from "joi";

export class JoiValidationSchema {
     static signupSchema = joi.object(
          {
               name: joi.string().min(2).optional().allow(null, ''),
               email: joi.string().email().required(),
               password: joi.string().min(6).max(200).required()
          }
     );
}