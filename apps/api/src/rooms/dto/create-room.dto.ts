import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name!: string;

  @IsString()
  @IsOptional()
  personality?: string;
}
