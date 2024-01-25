import { Types } from "mongoose";
import { Role } from "./authUser";

export type User = {
     account_id?: string | Types.ObjectId;
     user_id?: string | Types.ObjectId;
     email: string;
     name?: string;
     role: Role;
     password?: string;
}