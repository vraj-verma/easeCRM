import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Schema, Types } from "mongoose";
import { Contact, ContactDocument } from "../schemas/contact.schema";
import { Paged } from "../types/pagination";
import { AssignContact } from "src/types/assignContact";

@Injectable()
export class ContactService {
     constructor(
          @InjectModel(Contact.name) private contactDB: Model<ContactDocument>
     ) { }

     async createContact(contact: Contact): Promise<Contact> {
          const response = await this.contactDB.create(contact);
          return response ? response : null;
     }

     async getContactById(user_id: string, contact_id: string): Promise<Contact> {
          const filter = { _id: contact_id, user_id };
          const response = await this.contactDB.findOne(filter, { __v: 0 }).lean();
          return response ? response : null;
     }

     async getContactByEmail(contact: Contact): Promise<Contact> {
          const filter = { user_id: contact.user_id, email: contact.email }
          const response = await this.contactDB.findOne(filter).lean();
          return response ? response : null;
     }

     async getContactByEmailAndAccountId(contact: Contact): Promise<Contact> {
          const filter = { account_id: contact.account_id, email: contact.email }
          const response = await this.contactDB.findOne(filter).lean();
          return response ? response : null;
     }

     async getContacts(user_id: string, paged: Paged): Promise<Contact[]> {
          const response = await this.contactDB.find({ user_id })
               .skip(paged.offset)
               .limit(paged.limit)
               .lean();

          return response ? response as unknown as Contact[] : null;
     }

     async deleteContacts(contact_id: any, user_id: string): Promise<number> {
          const filter = { _id: contact_id, user_id };
          const response = await this.contactDB.deleteMany(filter);
          return response ? response.deletedCount : 0;
     }

     async updateContactById(contact_id: string, contact: Contact): Promise<boolean> {
          const filter = { _id: contact_id };
          const response = await this.contactDB.updateOne(filter, contact);
          return response ? response.modifiedCount > 0 : false;
     }

     async patchUpdateContactById(contact_id: string, contact: any) {
          const filter = { _id: contact_id };
          const response = await this.contactDB.updateOne(filter, {
               $set: {
                    ...contact
               }
          });
          return response ? response.modifiedCount > 0 : false;
     }

     async assignContactToOtherUser(payload: AssignContact, account_id: string): Promise<boolean> {
          const filter = { _id: { $in: payload.contact_id }, account_id };
          const response = await this.contactDB.updateMany(filter, {
               $set: {
                    user_id: payload.user_id
               }
          });

          return response ? response.modifiedCount > 0 : false;
     }
}