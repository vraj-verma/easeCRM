export class AuthUser {
     _id: string;
     account_id: string;
     email: string;
     name: string;
     status: Status;
     role: Role;
     users_used: number;
     users_limit: number;
     avatar?: string;
     verified?: boolean;
     token?: string;
}

export enum Status {
     active = 'Active',
     deactive = 'Deactive'
}

export enum Role {
     Owner = 'Owner',
     Admin = 'Admin',
     Viewer = 'Viewer'
}