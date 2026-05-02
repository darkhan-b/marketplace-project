import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'Olzhas', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}