const Router = require('koa-router')

const { uploadChunk, merge } = require('../controller/file.controller')

const router = new Router({ prefix: '/file' })

router.post('/upload/chunk', uploadChunk)

router.post('/merge', merge)

module.exports = router
