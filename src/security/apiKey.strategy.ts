import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Role } from "../enums/enums";
import { Strategy } from 'passport-custom';
import { AccountService } from "../services/account.service";
import { ApiKeyService } from "../services/apiKey.service";

@Injectable()
export class APIKeyStrategy extends PassportStrategy(Strategy, 'apikey') {
    constructor(
        private apiKeyService: ApiKeyService,
        private accountService: AccountService,
    ) {
        super();
    }

    async validate(req: Request) {
        const apiKey = req?.headers['apikey'];

        if (!apiKey) {
            throw new HttpException(
                `Unauthorized`,
                HttpStatus.UNAUTHORIZED
            );
        }

        const apiKeyResponse = await this.apiKeyService.getApiKeyByKey(apiKey)

        if (!apiKeyResponse) {
            throw new HttpException(
                `Unauthorized`,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (!apiKeyResponse.is_enabled) {
            throw new HttpException(
                `Unauthorized, API key: ${apiKey} is not active`,
                HttpStatus.UNAUTHORIZED
            );
        }

        const user = await this.accountService.getAccountById(apiKeyResponse['account_id']);

        if (!user || !user.result.verified) {
            throw new HttpException(
                `Unauthorized, Please verify your account first.`,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (user.status !== 'Active') {
            throw new HttpException(
                `Unauthorized, Your account is not Active`,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (apiKeyResponse['role'] == Role.VIEWER) {
            throw new HttpException(
                `Unauthorized, your current role : ${Role.VIEWER} does not allow to access.`,
                HttpStatus.UNAUTHORIZED
            );
        }

        if (!apiKeyResponse) {
            throw new HttpException(`Unauthorized`, HttpStatus.UNAUTHORIZED);
        }

        return { ...apiKeyResponse, ...user.result };
    }
}