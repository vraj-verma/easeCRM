import { ApiProperty } from "@nestjs/swagger";

export class Paged {
    @ApiProperty({ required: false, default: 0 })
    offset: number = 0;

    @ApiProperty({ required: false, default: 10, maximum: 1000 })
    limit: number = 10;

    @ApiProperty({ required: false })
    sort?: string = 'createdAt';
}