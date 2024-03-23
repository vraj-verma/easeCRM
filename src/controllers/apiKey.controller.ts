import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import { Request, Response } from 'express'
import { ApiKey } from "../schemas/apiKey.schema";
import { ApiKeyService } from "../services/apiKey.service";
import { JwtAuthGuard } from "../security/jwt.guard";
import { AuthUser } from "../types/authUser";
import { Utility } from "../utils/utility";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RolesGuard } from "../security/roles.guard";
import { Roles } from "../security/roles.decorator";
import { Role } from "../enums/enums";

@ApiTags('ApiKey Controller')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('apikey')
export class ApiKeyController {

    constructor(
        private apiKeyService: ApiKeyService,
        private utility: Utility,
    ) { }

    @ApiOperation({ summary: 'Create an API KEY' })
    @ApiResponse({ type: ApiKey })
    @Roles(Role.OWNER, Role.ADMIN)
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

    @ApiOperation({ summary: 'Get ApiKeys' })
    @ApiResponse({ type: [ApiKey] })
    @Get()
    async getApiKeys(
        @Req() req: Request,
        @Res() res: Response,
    ) {

        console.log('hehheh')

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

    @ApiOperation({ summary: 'Get ApiKey by Key' })
    @ApiResponse({ type: ApiKey })
    @Get('/:apikey')
    async getApiKeyByKey(
        @Req() req: Request,
        @Res() res: Response,
        @Param('apikey') apiKey: string
    ) {

        const response = await this.apiKeyService.getApiKeyByKey(apiKey);

        if (!response) {
            throw new HttpException(
                `No apikey id found with api key: ${apiKey}`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(response);

    }


    @ApiOperation({ summary: 'Reset ApiKey' })
    @ApiResponse({ type: 'string' })
    @Roles(Role.OWNER, Role.ADMIN)
    @Get('reset')
    async resetApiKey(
        @Req() req: Request,
        @Res() res: Response,
        @Param('apikey') apiKey: string
    ) {
        const isApiKeyExist = await this.apiKeyService.getApiKeyByKey(apiKey);

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

    @ApiOperation({ summary: 'Toggle ApiKey Status' })
    @ApiResponse({ type: 'string' })
    @Patch('switch-status')
    async switchKeyAvailibility(
        @Req() req: Request,
        @Res() res: Response,
    ) {

        const authUser = <AuthUser>req.user;

        const [apiKey] = await this.apiKeyService.getApiKeys(authUser.account_id);

        if (!apiKey) {
            throw new HttpException(
                `Api key with account id: ${authUser.account_id}, does not exist`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.apiKeyService.switchKeyAvailibility(authUser.account_id);
        if (!response) {
            throw new HttpException(
                `Failed to swtich api key status`,
                HttpStatus.NOT_FOUND
            );
        }

        const currentStatus = apiKey['is_enabled'];

        res.status(201).json(
            {
                message: `Api key with key: ${apiKey['_id']} ${currentStatus ? 'disabled' : 'enabled'} successfully`
            }
        );
    }

    @ApiOperation({ summary: 'Delete an ApiKey(s)' })
    @ApiResponse({ type: 'String' })
    @Roles(Role.OWNER, Role.ADMIN)
    @Delete()
    async deleteApiKeys(
        @Req() req: Request,
        @Res() res: Response,
        @Query('apiKey') keys: any,
    ) {

        if (typeof keys == 'string') {
            keys = keys.split(',')
        }

        const authUser = <AuthUser>req.user;

        const apiKeys = await this.apiKeyService.getApiKeys(authUser.account_id);

        if (!apiKeys) {
            throw new HttpException(
                `Apikey not found with account id: ${authUser.account_id}`,
                HttpStatus.NOT_FOUND
            );
        }

        const response = await this.apiKeyService.deleteApiKeys(keys)

        if (!response) {
            throw new HttpException(
                `Failed to delete api key(s)`,
                HttpStatus.NOT_FOUND
            );
        }

        res.status(200).json(
            {
                message: `Apikey(s) with key: ${keys}, deleted successfully.`
            }
        )

    }
}