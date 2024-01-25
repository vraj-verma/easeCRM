export type Account = {
     account_id?: number | string;
     name?: string;
     address?: Address;
     avatar?: string;
     bio?: string;
     plan?: Plan
     users_limit?: number;
     users_used?: number;
     createdAt?: Date;
     updatedAt?: Date;
}

export enum Plan {
     free = 'Free',
     basic = 'Basic',
     pro = 'Pro'
}

export class Address {
     street?: string;
     city?: string;
     country?: string;
     pinCode?: number;
}