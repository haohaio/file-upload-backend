const path = require('path')
const multiparty = require('multiparty')
const fse = require('fs-extra')

const UPLOAD_DIR = path.join(__dirname, '../upload')

class FileController {
  async uploadChunk(ctx) {
    // 不能在回调函数中直接返回 ctx.body，需要用 Promise 包裹一下
    await new Promise((resolve) => {
      const form = new multiparty.Form()
      form.parse(ctx.req, async (err, fields, files) => {
        const [chunk] = files.chunk
        const [hash] = fields.hash
        const [filename] = fields.filename
        const chunkDir = path.resolve(UPLOAD_DIR, filename)

        if (!fse.existsSync(chunkDir)) {
          await fse.mkdirs(chunkDir)
        }

        await fse.move(chunk.path, `${chunkDir}/${hash}`)

        resolve()
      })
    })

    ctx.body = {
      code: 0,
      message: '上传成功',
      result: '',
    }
  }

  async merge(ctx) {
    const { filename, fileHash, size } = ctx.request.body
    const ext = extractExt(filename)
    const filePath = path.resolve(UPLOAD_DIR, `${fileHash}${ext}`)

    await mergeFileChunk(filePath, fileHash, size)

    ctx.body = {
      code: 0,
      message: `上传${filename}成功`,
      result: '',
    }
  }
}

// 提取文件后缀名
const extractExt = (filename) => filename.slice(filename.lastIndexOf('.'))

const pipeStream = (path, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fse.createReadStream(path)
    readStream.on('end', () => {
      // 删除切片
      fse.unlinkSync(path)
      resolve()
    })
    readStream.pipe(writeStream)
  })
}

async function mergeFileChunk(filePath, fileHash, size) {
  const chunkDir = path.resolve(UPLOAD_DIR, fileHash)
  const chunkPaths = await fse.readdir(chunkDir)

  chunkPaths.sort((a, b) => a.split('_')[1] - b.split('_')[1])

  await Promise.all(
    chunkPaths.map((chunkPath, index) => {
      return pipeStream(
        path.resolve(chunkDir, chunkPath),
        fse.createWriteStream(filePath, {
          start: index * size,
          end: (index + 1) * size,
        })
      )
    })
  )

  // 删除切片文件夹
  fse.rmdirSync(chunkDir) // 合并后删除保存切片的目录
}

module.exports = new FileController()
