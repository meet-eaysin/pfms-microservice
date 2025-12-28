import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { TriggerType, ActionType } from '../../../domain/entities/automation-rule.model';

export class CreateRuleDto {
  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ example: 'High Spend Alert' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Alert when expense is over $100' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: TriggerType, example: TriggerType.EXPENSE_CREATED })
  @IsEnum(TriggerType)
  triggerType!: TriggerType;

  @ApiProperty({ example: { amount_gt: 100 } })
  @IsObject()
  conditions!: Record<string, unknown>;

  @ApiProperty({ enum: ActionType, example: ActionType.SEND_NOTIFICATION })
  @IsEnum(ActionType)
  actionType!: ActionType;

  @ApiProperty({ example: { message: 'High spend detected!' } })
  @IsObject()
  actionPayload!: Record<string, unknown>;
}
