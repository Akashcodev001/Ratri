import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(24)
  displayName!: string;

  @IsString()
  @IsOptional()
  password?: string;
}
