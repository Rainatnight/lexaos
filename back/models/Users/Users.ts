import mongoose, { Schema } from 'mongoose'

import { UserType } from './Users.type'

const UserSchema = new Schema(
  {
    _id: Schema.Types.String,
    login: { type: Schema.Types.String },
    password: { type: Schema.Types.String },
    updatedAt: { type: Schema.Types.Number },
    createdAt: { type: Schema.Types.Number },
  },
  { timestamps: true, collection: 'users' }
)

export default mongoose.model<UserType & mongoose.Document>('Users', UserSchema)
