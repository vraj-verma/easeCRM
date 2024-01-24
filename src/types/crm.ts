export type CRM = {
     crm_id?: number | string;
     user_id?: number | string;
     contact_name?: string;
     contact_email?: string;
     crm_status?: CRM_STATUS;
     deal?: Deal;
     createdAt?: Date;
     updatedAt?: Date;
}

export enum CRM_STATUS {
     hot = 'Hot',
     cold = 'Cold',
     warm = 'Warm',
}

export enum Deal {
     done = 'Done',
     progress = 'Progress',
     rejected = 'Rejected',
}