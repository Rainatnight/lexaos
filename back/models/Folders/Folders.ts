import mongoose, { Schema } from 'mongoose'

import { FolderType } from './Folders.type'

const FoldersSchema = new Schema(
  {
    _id: Schema.Types.String,
    userId: { type: Schema.Types.String, ref: 'User', required: true },
    type: { type: Schema.Types.String, required: true }, // "pc" | "vs" | "folder"
    name: { type: Schema.Types.String, required: true },
    parentId: { type: String, default: null }, // id папки, если внутри
    x: { type: Schema.Types.Number, default: 0 },
    y: { type: Schema.Types.Number, default: 0 },

    updatedAt: { type: Schema.Types.Number },
    createdAt: { type: Schema.Types.Number },
  },
  { timestamps: true, collection: 'folders' }
)

export default mongoose.model<FolderType & mongoose.Document>('Folders', FoldersSchema)
