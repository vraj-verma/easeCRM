import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { Request, Response } from 'express'
import { ApiKey } from "../schemas/apiKey.schema";
import { ApiKeyService } from "../services/apiKey.service";
import { JwtAuthGuard } from "../security/jwt.guard";
import { AuthUser } from "../types/authUser";
import { Utility } from "src/utils/utility";

@UseGuards(JwtAuthGuard)
@Controller('apikey')
export class ApiKeyController {

    constructor(
        private apiKeyService: ApiKeyService,
        private utility: Utility,
    ) { }

    @Post()
    async createApiKey(
        @Req() req: Request,
        @Res() res: Response,
        @Body() apiKey: ApiKey
    ) {
        const { account_id } = <AuthUser>req.user;

        const apiKeys = await this.apiKeyService.getApiKeys(account_id);

        if (apiKeys) {
            if (apiKeys.find(key => key['name'] === apiKey.name)) {
                throw new HttpException(
                    `Api key name is already exist`,
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        apiKey.account_id = account_id;
        apiKey.apiKey = this.utility.randomNumber();

        const response = await this.apiKeyService.createApiKey(apiKey);
        if (!response) {
            throw new HttpException(
                `Apikey not created`,
                HttpStatus.BAD_REQUEST
            );
        }

        res.status(201).json(response);
    }

    @Get()
    async getApiKeys(
        @Req() req: Request,
        @Res() res: Response,
    ) {

        const { account_id } = <AuthUser>req.user;

        const response = await this.apiKeyService.getApiKeys(account_id);

        if (!response) {
            throw new HttpException(
                `No apikeys found`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);
    }

    @Get('/:apikey')
    async getApiKeyByApiKey(
        @Req() req: Request,
        @Res() res: Response,
        @Param('apikey') apiKey: string
    ) {

        const response = await this.apiKeyService.getApiKeyByApiKey(apiKey);

        if (!response) {
            throw new HttpException(
                `No apikey id found with api key: ${apiKey}`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);

    }

    @Get('reset')
    async resetApiKey(
        @Req() req: Request,
        @Res() res: Response,
        @Param('apikey') apiKey: string
    ) {
        const isApiKeyExist = await this.apiKeyService.getApiKeyByApiKey(apiKey);

        if (!isApiKeyExist) {
            throw new HttpException(
                `Api key with key:${apiKey}, does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.apiKeyService.resetApiKey(apiKey);
        if (!response) {
            throw new HttpException(
                `Api key did not reset`,
                HttpStatus.SERVICE_UNAVAILABLE
            );
        }

        res.status(200).json({
            message: 'Apikey reset successfully.',
            response
        });
    }
}