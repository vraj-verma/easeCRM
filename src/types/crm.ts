import { CRM_STATUS, Deal } from "../enums/enums";

export type CRM = {
     crm_id?: number | string;
     _id?: number | string;
     contact_name?: string;
     contact_email?: string;
     crm_status?: CRM_STATUS;
     deal?: Deal;
     createdAt?: Date;
     updatedAt?: Date;
}

