export type FolderType = {
  _id: string
  userId: string
  type: 'pc' | 'vs' | 'bin' | 'folder' | string
  parentId: string
  x: number
  y: number
  name: string
  content?: string
  createdAt: number
  updatedAt: number
}
