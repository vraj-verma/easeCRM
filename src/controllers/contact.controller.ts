import {
     Body,
     Controller,
     Delete,
     Get,
     HttpException,
     HttpStatus,
     Param,
     Patch,
     Post,
     Put,
     Query,
     Req,
     Res,
     UseGuards
} from "@nestjs/common";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { AuthUser } from "../types/authUser";
import { Paged, } from '../types/pagination';
import { Contact } from "../schemas/contact.schema";
import { JwtAuthGuard } from "../security/jwt.guard";
import { RolesGuard } from "../security/roles.guard";
import { AssignContact } from "../types/assignContact";
import { ValidationPipe } from "../pipes/validation.pipe";
import { ContactService } from "../services/contact.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JoiValidationSchema } from "../validations/schema.validation";
import { UserService } from "../services/users.service";
import { MyRoles } from "src/security/roles.decorator";
import { Role } from "src/enums/enums";

@ApiTags('Contact Controller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact')
export class ContactController {

     constructor(
          private contactService: ContactService,
          private userService: UserService,
     ) { }

     @ApiOperation({ summary: 'Create contact' })
     @ApiResponse({ type: Contact })
     @Post()
     async create(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.createContactSchema)) contact: Contact
     ) {
          const { _id, account_id } = <AuthUser>req.user;

          contact.user_id = _id;
          contact.account_id = account_id

          const isExist = await this.contactService.getContactByEmail(contact);
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

     @ApiOperation({ summary: 'Get contacts associate with user' })
     @ApiResponse({ type: [Contact] })
     @Get()
     async getContacts(
          @Req() req: Request,
          @Res() res: Response,
          @Query() paged: Paged
     ) {

          const { _id } = <AuthUser>req.user;

          const response = await this.contactService.getContacts(_id, paged);
          if (!response || response.length < 1) {
               throw new HttpException(
                    `No Contacts found`,
                    HttpStatus.NOT_FOUND
               );
          }

          res.status(200).json(response);
     }

     @ApiOperation({ summary: 'Get contact by contact id' })
     @ApiResponse({ type: Contact })
     @Get(':id')
     async getContactById(
          @Req() req: Request,
          @Res() res: Response,
          @Param('id') contact_id: string
     ) {

          if (!mongoose.isValidObjectId(contact_id)) {
               throw new HttpException(
                    `Invalid id: ${contact_id}`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const { _id: user_id } = <AuthUser>req.user;

          const response = await this.contactService.getContactById(user_id, contact_id);

          if (!response) {
               throw new HttpException(
                    `No Contact found with contact id: ${contact_id}`,
                    HttpStatus.NOT_FOUND
               );
          }

          res.status(200).json(response);
     }

     @ApiOperation({ summary: 'Assign contact to someone in your team' })
     @ApiResponse({ type: 'string' })
     @MyRoles(Role.ADMIN, Role.OWNER)
     @Patch('assign')
     async assignContacts(
          @Req() req: Request,
          @Res() res: Response,
          @Body(new ValidationPipe(JoiValidationSchema.assignContactSchema)) payload: AssignContact,
     ) {

          const { account_id } = <AuthUser>req.user;

          const isUserExists = await this.userService.getUserByUserId(payload.user_id, account_id);
          if (!isUserExists) {
               throw new HttpException(
                    `No user exist with user id: ${payload.user_id}`,
                    HttpStatus.NOT_FOUND
               );
          }

          const response = await this.contactService.assignContactToOtherUser(payload, account_id)

          if (!response) {
               throw new HttpException(
                    `Failed to assign contact(s)`,
                    HttpStatus.BAD_REQUEST
               );
          }
          res.status(200).json(
               {
                    message: `Contact(s): [${payload.contact_id}] assigned to user: ${payload.user_id}`
               }
          );
     }

     @ApiOperation({ summary: 'Update contact by contact id' })
     @ApiResponse({ type: 'string' })
     @Put(':id')
     async updateContactById(
          @Req() req: Request,
          @Res() res: Response,
          @Param('id') contact_id: string,
          @Body(new ValidationPipe(JoiValidationSchema.createContactSchema)) contact: Contact
     ) {
          const { _id, account_id } = <AuthUser>req.user;

          contact.account_id = account_id;

          const isEmailAlreadyExist = await this.contactService.getContactByEmailAndAccountId(contact);

          if (isEmailAlreadyExist) {
               throw new HttpException(
                    `This email is already exist: ${contact.email}`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const getContact = await this.contactService.getContactById(_id, contact_id);
          if (!getContact) {
               throw new HttpException(
                    `No Contact found with contact id: ${contact_id}`,
                    HttpStatus.NOT_FOUND
               );
          }

          const response = await this.contactService.updateContactById(contact_id, contact);

          if (!response) {
               throw new HttpException(
                    `Failed to update contact`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    message: `Contact with id: ${contact_id} updated successfully.`
               }
          );
     }

     @ApiOperation({ summary: 'Partial update contact by contact id' })
     @ApiResponse({ type: 'string' })
     @Patch(":id")
     async partialUpdateContactById(
          @Req() req: Request,
          @Res() res: Response,
          @Param('id') contact_id: string,
          @Body() contact: any
     ) {

          const { _id, account_id } = <AuthUser>req.user;

          contact.account_id = account_id;

          const isEmailAlreadyExist = await this.contactService.getContactByEmailAndAccountId(contact);

          if (isEmailAlreadyExist) {
               throw new HttpException(
                    `This email is already exist: ${contact.email}`,
                    HttpStatus.BAD_REQUEST
               );
          }

          const getContact = await this.contactService.getContactById(_id, contact_id);
          if (!getContact) {
               throw new HttpException(
                    `No Contact found with contact id: ${contact_id}`,
                    HttpStatus.NOT_FOUND
               );
          }

          const response = await this.contactService.patchUpdateContactById(contact_id, contact);

          if (!response) {
               throw new HttpException(
                    `Failed to update contact`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    message: `Contact with id: ${contact_id} updated successfully.`
               }
          );
     }

     @ApiOperation({ summary: 'Delete contact by contact id(s)' })
     @ApiResponse({ type: 'string' })
     @Delete()
     async deleteContact(
          @Req() req: Request,
          @Res() res: Response,
          @Query('id') contact_ids: any,
     ) {

          const { _id } = <AuthUser>req.user;

          if (typeof contact_ids === 'string') {
               contact_ids = contact_ids.split(',');
          }

          const isContactExist = await this.contactService.getContactById(_id, contact_ids);
          if (!isContactExist) {
               throw new HttpException(
                    `No contact found with id(s): ${contact_ids}`,
                    HttpStatus.NOT_FOUND
               );
          }

          const response = await this.contactService.deleteContacts(contact_ids, _id);
          if (!response) {
               throw new HttpException(
                    `Failed to delete contact with id(s): ${contact_ids}`,
                    HttpStatus.BAD_REQUEST
               );
          }

          res.status(200).json(
               {
                    message: `Contact with id(s): ${contact_ids} deleted successfully.`
               }
          )
     }


}