import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { SpaceEquipmentType } from 'src/lib/type';

export class CreateSpaceEquipmentDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty({
    description: 'SpaceEquipment spaceId in uuid',
    required: true,
  })
  spaceId: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    description: 'SpaceEquipment name',
    required: true,
  })
  name: string;

  @IsString()
  @ApiProperty({
    description:
      'SpaceEquipment type: general|audio|video|lighting|stationery|furniture|sports|kitchen|craft|safty|computer|facility',
    required: true,
  })
  type: SpaceEquipmentType;

  @IsInt()
  @Min(1)
  @ApiProperty({
    description: 'SpaceEquipment quantity',
    required: true,
  })
  quantity: number;

  @IsString()
  @MaxLength(1000)
  @ApiProperty({
    description: 'SpaceEquipment details',
    required: true,
  })
  details: string;
}
