export type AuthUser = {
     email: string;
     name: string;
     status: Status;
     account_id: string;
     _id: string;
     role: Role;
     users_used: number;
     users_limit: number;
}

export enum Status {
     active = 'Active',
     deactive = 'Deactive'
}

export enum Role {
     owner = 'Owner',
     admin = 'Admin',
     viewer = 'viewer'
}