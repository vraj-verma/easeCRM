import { Role } from "../enums/enums";

export type ApiKey = {
     apiKey_id?: string;
     apiKey?: string;
     role: Role;
     createdAt?: Date;
     updatedAt?: Date;
}