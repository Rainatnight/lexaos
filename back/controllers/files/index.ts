import dotenv from 'dotenv'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

import { DEFAULT_FILE_PATH, errorsCodes } from '@constants/common'
import { createId } from '@helpers/createId'

dotenv.config()

export class FilesController {
  upload = async (req: Request, res: Response) => {
    try {
      const { files } = req

      if (!files) return res.status(400).json({ code: errorsCodes.NOT_FOUND })

      if (!req.files || !req.files.file) {
        return res.status(400).json({ code: errorsCodes.NOT_FOUND })
      }

      const defaultPath = process.env.DATA_DIR || DEFAULT_FILE_PATH
      const file = files.file as any
      const newName = createId()

      const pathName = path.join(defaultPath, newName)
      await file.mv(pathName)
      fs.writeFileSync(
        `${defaultPath}/${newName}.json`,
        JSON.stringify({
          _id: newName,
          type: file.mimetype,
          title: file.name,
        }),
        'utf8'
      )
      return res.json({ data: newName })
    } catch (error) {
      return res.status(500).json({ code: errorsCodes.SOMETHING_WRONG })
    }
  }

  download = async (req: Request, res: Response) => {
    const { fileId } = req.params
    const path = `${process.env.DATA_DIR || DEFAULT_FILE_PATH}/${fileId}`

    fs.promises
      .stat(path)
      .then(async (stat) => {
        const meta = JSON.parse(await fs.promises.readFile(`${path}.json`, 'utf8'))
        res.writeHead(200, {
          'Content-Type': meta.type,
          'Cache-Control': 'max-age=31536000',
          'Content-Length': stat.size,
          ETag: fileId,
        })
        const readStream = fs.createReadStream(path)
        readStream.pipe(res)
      })
      .catch((error) => {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('file not exists')
      })
  }
}
