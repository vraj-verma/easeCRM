import { Role } from "./authUser";

export type AddUser = {
     email: string;
     name?: string;
     role: Role;
}