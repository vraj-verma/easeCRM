import * as joi from "joi";
import { Address } from "../types/account";
import { Role } from "../enums/enums";

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

     // user related validation
     static inviteUserSchema = joi.object({
          name: joi.string().min(2).max(20).required(),
          email: joi.string().email().required(),
          role: joi.string().valid(...Object.values(Role)).required(),
     });

     static joinUserSchema = joi.object({
          password: joi.string().min(6).max(200).required(),
          confirmPassword: joi.string().min(6).max(200).required()
     });

     static updatePasswordSchema = joi.object({
          password: joi.string().min(6).max(100).required(),
          confirmPassword: joi.string().min(6).max(100).required(),
     });

     // contact related validation
     static createContactSchema = joi.object({
          _id: joi.string().optional().allow(null, ''),
          name: joi.string().min(2).max(20).required(),
          email: joi.string().email().required(),
          phone: joi.string().min(10).max(10).required(),
          company: joi.string().min(2).optional().allow(null, ''),
          followup: joi.string().optional().allow(null, ''),
          source: joi.string().optional().allow(null, ''),
          hotness: joi.number().optional().allow(null, ''),
          tags: joi.array().items(joi.string().optional().allow(null, '')).optional().allow(null, ''),
          custom_fields: joi.array().items(joi.object().optional().allow(null, '')).optional().allow(null, ''),
     });

     static assignContactSchema = joi.object({
          user_id: joi.string().min(24).max(24).required(),
          contact_id: joi.array().items(joi.string().required()).required(),
          message: joi.string().optional().allow(null, '')
     });

     static paginationSchema = joi.object({
          offset: joi.number().optional().default(0),
          limit: joi.number().optional().default(10),
          sort: joi.string().optional().default('createdAt'),
     });
}