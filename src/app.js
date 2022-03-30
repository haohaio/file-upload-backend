const Koa = require('koa')
const Router = require('koa-router')
const KoaStatic = require('koa-static')
const cors = require('koa2-cors') //跨域处理

const path = require('path')

const app = new Koa()

app.use(
  cors({
    origin: '*',
    maxAge: 5, // 指定本次预检请求的有效期，单位为秒。
    credentials: true, // 是否允许发送 Cookie
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // 设置所允许的 HTTP 请求方法
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'], // 设置服务器支持的所有头信息字段
    // exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 设置获取其他自定义字段
  })
)

app.use(KoaStatic(path.join(__dirname, '/public')))

const router = new Router()
app.use(router.routes())

app.listen(3000, () => {
  console.log(`server is running on http://localhost:3000`)
})
