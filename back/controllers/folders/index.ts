import { Request, Response } from 'express'

import { errorsCodes } from '@constants/common'
import { createId } from '@helpers/createId'
import { sanitizeHtml } from '@helpers/validator/sanitizehtml'

import Folders from '@models/Folders/Folders'

export class FoldersController {
  constructor() {}

  async getFolders(req: Request, res: Response) {
    try {
      const { userId } = req.user as any
      const items = await Folders.find({ userId }, { createdAt: 0, updatedAt: 0, __v: 0, userId: 0 }).lean()
      const mappedItems = items.map((item) => {
        const { _id, ...rest } = item
        return {
          ...rest,
          id: _id,
        }
      })

      res.json(mappedItems)
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async createFolder(req: Request, res: Response) {
    try {
      const { name, x, y, parentId, type, content } = req.body
      const { userId } = req.user as any

      const folder = await Folders.create({
        userId,
        _id: createId(),
        type,
        name: name || 'Новая папка',
        x: x ?? 0,
        y: y ?? 0,
        parentId: parentId ?? null,
        content,
      })

      return res.json({ id: folder._id })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async renameFolder(req: Request, res: Response) {
    try {
      const { id, newName } = req.body
      const { userId } = req.user as any

      if (!id || !newName) {
        return res.status(400).json({ error: 'id and newName are required' })
      }

      const folder = await Folders.findOneAndUpdate(
        { _id: id, userId }, // проверяем, что папка принадлежит юзеру!
        { name: newName },
        { new: true }
      ).lean()

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' })
      }

      return res.json(folder)
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async moveFolder(req: Request, res: Response) {
    try {
      const { id, newX, newY } = req.body
      const { userId } = req.user as any

      if (!id || !newX || !newY) {
        return res.status(400).json({ error: 'id and newName are required' })
      }

      const folder = await Folders.findOneAndUpdate(
        { _id: id, userId }, // проверяем, что папка принадлежит юзеру!
        { x: newX, y: newY },
        { new: true }
      ).lean()

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' })
      }

      return res.json(folder)
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async moveToFolder(req: Request, res: Response) {
    try {
      const { id, parentId, x, y } = req.body
      const { userId } = req.user as any

      // parentId может быть null (рабочий стол), так что не проверяем
      if (!id) {
        return res.status(400).json({ error: 'id is required' })
      }

      const updateData: any = { parentId }

      if (typeof x === 'number') updateData.x = x
      if (typeof y === 'number') updateData.y = y

      const folder = await Folders.findOneAndUpdate({ _id: id, userId }, updateData, { new: true }).lean()

      if (!folder) {
        return res.status(404).json({ error: 'Folder not found' })
      }

      return res.json(folder)
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async clearbin(req: Request, res: Response) {
    try {
      const { ids } = req.body

      if (!Array.isArray(ids)) {
        return res.status(400).json({ error: 'ids must be an array' })
      }

      await Folders.deleteMany({ _id: { $in: ids } })

      return res.json()
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  async saveText(req: Request, res: Response) {
    try {
      const { id, content } = req.body

      if (!id || typeof content !== 'string') {
        return res.status(400).json({
          error: 'id and content are required',
        })
      }

      if (content.length > 100_000) {
        return res.status(413).json({ error: 'Text file is too large' })
      }

      const cleanContent = sanitizeHtml(content)

      const result = await Folders.findOneAndUpdate({ _id: id, type: 'txt' }, { content: cleanContent }, { new: true })

      if (!result) {
        return res.status(404).json({ error: 'Text file not found' })
      }

      return res.json({ success: true })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }
}
