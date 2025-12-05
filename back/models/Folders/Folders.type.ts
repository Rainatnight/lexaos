export type FolderType = {
  _id: string
  userId: string
  type: 'pc' | 'vs' | 'trash' | 'folder' | string
  parentId: string
  x: number
  y: number
  name: string
  createdAt: number
  updatedAt: number
}
