import { IsString, IsOptional, IsObject, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStepDto {
  @ApiProperty({ example: 'click' })
  @IsString()
  actionType: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selector?: string;

  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  url: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  textContent?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  inputPreview?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  screenshotKey?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  metadata?: any;
}

export class UpdateStepDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  index?: number;
}

export class ReorderStepItem {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  index: number;
}

export class ReorderStepsDto {
  @ApiProperty({ type: [ReorderStepItem] })
  @IsObject({ each: true })
  updates: ReorderStepItem[];
}