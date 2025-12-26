import {
  IsString,
  IsBoolean,
  IsOptional,
  IsNumber,
  MinLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  type: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  last4: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  brand: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  expiryYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  holderName?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentMethodDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  type?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(4)
  last4?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  brand?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  expiryMonth?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(2024)
  expiryYear?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  holderName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
