import mongoose, { Schema } from 'mongoose'

import { IChatMessage } from './ChatMessages.type'

const ChatMessagesSchema = new Schema(
  {
    _id: Schema.Types.String,
    from: { type: Schema.Types.String, ref: 'Users' },
    to: { type: Schema.Types.String, ref: 'Users' },
    msg: { type: Schema.Types.String, ref: 'Users' },
    updatedAt: { type: Schema.Types.Number },
    createdAt: { type: Schema.Types.Number },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model<IChatMessage & mongoose.Document>('ChatMessages', ChatMessagesSchema)
