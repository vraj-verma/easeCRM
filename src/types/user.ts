import { Types } from "mongoose";
import { Role } from "./authUser";

export type User = {
     account_id?: string | Types.ObjectId;
     _id?: string | Types.ObjectId;
     email: string;
     name?: string;
     role: Role;
     password?: string;
     verified?: boolean;
     token?: string;
}