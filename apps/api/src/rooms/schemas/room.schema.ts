import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { RoomStatus, Personality, RoomSettings } from '@ratri/types';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, unique: true })
  roomCode: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String })
  personality: Personality;

  @Prop({ required: true, type: String, enum: ['CREATED', 'ACTIVE', 'IDLE', 'EXPIRED', 'ENDED'], default: 'CREATED' })
  status: RoomStatus;

  @Prop({ type: Object, required: true })
  settings: RoomSettings;

  @Prop()
  passwordHash?: string;

  @Prop()
  hostMemberId?: string;

  @Prop({ default: 0 })
  hostVersion: number;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Date, required: true, expires: 0 })
  purgeAt: Date;

  @Prop()
  endedAt?: Date;

  @Prop()
  endedReason?: string;

  @Prop({ required: true })
  createdByIpHash: string;

  @Prop({ default: Date.now })
  lastActivityAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
