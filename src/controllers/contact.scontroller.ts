import { Paged, } from './../types/pagination';
import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../security/jwt.guard";
import { RolesGuard } from "../security/roles.guard";
import { ContactService } from "../services/contact.service";
import { Request, Response } from "express";
import { Contact } from "src/schemas/contact.schema";
import { ValidationPipe } from "src/pipes/validation.pipe";
import { JoiValidationSchema } from "src/validations/schema.validation";
import { AuthUser } from "src/types/authUser";

@ApiTags('Contact Controller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact')
export class ContactController {

     constructor(
          private contactService: ContactService
     ) { }

     @Post()
     async create(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.createContactSchema)) contact: Contact
     ) {
          const { _id } = <AuthUser>req.user;

          contact.user_id = _id;

          const isExist = await this.contactService.getContactByEmail(contact.email);
          if (isExist) {
               throw new HttpException(
                    `Contact with email already exist: ${contact.email}`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const response = await this.contactService.createContact(contact);
          if (!response) {
               throw new HttpException(
                    `Failed to create contact`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(201).json(response);

     }

     @Get()
     async getContacts(
          @Req() req: Request,
          @Res() res: Response,
          @Query() paged: Paged
     ) {

          const { _id } = <AuthUser>req.user;

          const response = await this.contactService.getContacts(_id, paged);
          if (!response) {
               throw new HttpException(
                    `No Contacts found`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(response);
     }
}