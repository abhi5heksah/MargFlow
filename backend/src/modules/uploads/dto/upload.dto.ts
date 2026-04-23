import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GeneratePresignedUrlDto {
  @ApiProperty({ example: 'screenshot.png' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'image/png' })
  @IsString()
  mimeType: string;
}