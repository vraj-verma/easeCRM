import { Plan } from "../enums/enums";

type Account = {
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


class Address {
     street?: string;
     city?: string;
     country?: string;
     pinCode?: number;
}

export {
     Account,
     Address
}