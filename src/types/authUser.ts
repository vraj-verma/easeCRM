export type AuthUser = {
     email: string;
     name: string;
     status: Status;
     account_id: number | string;
     user_id: number | string;
     role: Role;
     users_used: number;
     users_limit: number;
}

export enum Status {
     active = 'Active',
     deactice = 'Deactive'
}

export enum Role {
     owner = 'Owner',
     admin = 'Admin',
     viewer = 'viewer'
}