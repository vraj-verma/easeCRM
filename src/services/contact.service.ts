import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Contact, ContactDocument } from "src/schemas/contact.schema";
import { Paged } from "src/types/pagination";

@Injectable()
export class ContactService {
     constructor(
          @InjectModel(Contact.name) private contactDB: Model<ContactDocument>
     ) { }

     async createContact(contact: Contact): Promise<Contact> {
          const response = await this.contactDB.create(contact);
          return response ? response : null;
     }

     async getContactById(contact_id: string): Promise<Contact> {
          const filter = { _id: contact_id };
          const response = await this.contactDB.findOne(filter).lean();
          return response ? response : null;
     }

     async getContactByEmail(email: string): Promise<Contact> {
          const response = await this.contactDB.findOne({ email }).lean();
          return response ? response : null;
     }

     async getContacts(user_id: string, paged: Paged): Promise<Contact[]> {
          const response = await this.contactDB.find({ user_id })
               .skip(paged.offset)
               .limit(paged.limit)
               .lean();
          return response ? response as unknown as Contact[] : null;
     }

     async deleteContacts(contact_id: any): Promise<number> {
          const filter = { _id: contact_id };
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
}