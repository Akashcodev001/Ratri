import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, index: true })
  roomCode: string;

  @Prop({ required: true })
  senderMemberId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: false })
  senderId?: string;

  @Prop({ required: true, maxlength: 1000 })
  text: string;

  @Prop({ type: Date, default: Date.now, index: true })
  createdAt: Date;

  @Prop({ type: Date, required: true, expires: 0 })
  purgeAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ roomCode: 1, createdAt: 1 });

