import { Role, Status } from "../enums/enums";

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


