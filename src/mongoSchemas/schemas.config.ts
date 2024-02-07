import { Logs, LogsSchema } from "../schemas/logs.schema";
import { User, UserSchema } from "../schemas/users.schema";
import { Account, AccountSchema } from "../schemas/account.schema";
import { Profile, ProfileSchema } from "../schemas/profile.schema";
import { ApiKey, ApiKeySchema } from "../schemas/apiKey.schema";

export const Schemas = [
     {
          name: Account.name, schema: AccountSchema
     },
     {
          name: User.name, schema: UserSchema
     },
     {
          name: Logs.name, schema: LogsSchema
     },
     {
          name: Profile.name, schema: ProfileSchema
     },
     {
          name: ApiKey.name, schema: ApiKeySchema
     }
]