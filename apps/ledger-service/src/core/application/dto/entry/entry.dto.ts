import { IsNotEmpty, IsString, IsDateString, IsArray, ValidateNested, IsEnum, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { Direction } from '../../../domain/models/journal-entry.model';

export class PostingLineDto {
  @IsNotEmpty()
  @IsUUID()
  accountId!: string;

  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @IsNotEmpty()
  @IsEnum(Direction)
  direction!: Direction;
}

export class PostJournalEntryDto {
  @IsNotEmpty()
  @IsDateString()
  date!: string;

  @IsNotEmpty()
  @IsString()
  description!: string;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PostingLineDto)
  lines!: PostingLineDto[];
}
