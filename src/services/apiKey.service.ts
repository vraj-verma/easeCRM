import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey } from "src/schemas/apiKey.schema";
import { Utility } from "src/utils/utility";

@Injectable()
export class ApiKeyService {
    constructor(
        @InjectModel(ApiKey.name) private apiKeyDB: Model<ApiKeyService>,
        private utility: Utility,
    ) { }

    async createApiKey(apiKey: ApiKey) {
        const response = await this.apiKeyDB.create(apiKey);
        return response ? response : null;
    }

    async getApiKeys(account_id: string) {
        const response = await this.apiKeyDB.find(
            {
                account_id: account_id
            }
        );

        return response ? response : null;
    }

    async getApiKeyByApiKey(apiKey: string) {
        const response = await this.apiKeyDB.findOne({ apiKey }).lean();
        return response ? response : null;
    }

    async resetApiKey(apiKey: string) {
        const newKey = this.utility.randomNumber();
        const response = await this.apiKeyDB.updateOne(
            {
                apiKey
            },
            {
                $set: {
                    apiKey: newKey
                }
            }
        );

        return response ? response : null;
    }

}