import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ApiKey } from "src/schemas/apiKey.schema";

@Injectable()
export class ApiKeyService {
    constructor(
        @InjectModel(ApiKey.name) private apiKeyDB: Model<ApiKeyService>
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

    async getApiKeyByApiKey(apiKey: string, account_id: string) {
        const response = await this.apiKeyDB.findOne(
                        // logic goes here
        );
        return response ? response : null;
    }

}