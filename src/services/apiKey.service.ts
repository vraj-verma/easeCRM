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

    async createApiKey(apiKey: ApiKey): Promise<ApiKey> {
        const response = await this.apiKeyDB.create(apiKey);
        return response ? response as unknown as ApiKey : null;
    }

    async getApiKeys(account_id: string): Promise<ApiKey[]> {
        const response = await this.apiKeyDB.find(
            {
                account_id: account_id
            }
        );

        return response ? response as unknown as ApiKey[] : null;
    }

    async getApiKeyByKey(apiKey: string): Promise<ApiKey> {
        const response = await this.apiKeyDB.findOne({ apiKey }).lean();
        return response ? response as unknown as ApiKey : null;
    }

    async resetApiKey(apiKey: string): Promise<Boolean> {
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

        return response ? response.modifiedCount > 0 : false;
    }

    async updateApiKey(apiKey: ApiKey) {
        const response = await this.apiKeyDB.updateOne(
            {
                account_id: apiKey.account_id
            },
            {
                $set: {
                    name: apiKey.name,
                    role: apiKey.role
                }
            }
        );

        return response ? response.modifiedCount > 0 : false;
    }

    async switchKeyAvailibility(account_id: string) {
        const response = await this.apiKeyDB.updateOne(
            {
                account_id
            },
            [
                {
                    $set: {
                        is_enabled: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$is_enabled", true] }, then: false },
                                    { case: { $eq: ["$is_enabled", false] }, then: true },
                                ],
                                default: true
                            }
                        }
                    }
                }
            ]

        );

        return response ? response.modifiedCount > 0 : false;
    }

    async deleteApiKeys(apiKeys: string[]) {
        const response = await this.apiKeyDB.deleteMany({ apiKey: { $in: apiKeys } });
        return response ? response : false;
    }

    // at time of account delete
    async deleteKeyByAccountId(account_id: string) {
        const response = await this.apiKeyDB.deleteMany({ account_id });
        return response ? response.deletedCount > 0 : false;
    }


}