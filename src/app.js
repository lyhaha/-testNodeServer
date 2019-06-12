const http = require('http')
const path = require('path')
const fs = require('fs')
const Handlebars = require('handlebars')
const config = require('./config/default')

const tplPath = path.join(__dirname, './template/dir.tpl')
const  source = fs.readFileSync(tplPath)
const template = Handlebars.compile(source.toString())
const server = http.createServer((req, res) => {
  const filePath = path.join(config.root, req.url)
  fs.stat(filePath, (err, stats) => {
    if (err) {
      res.statusCode = 404
      res.setHeader('Content-Type', 'text/plain')
      res.end('not find')
      return
    }

    if (stats.isFile()) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain')
      fs.createReadStream(filePath).pipe(res)
    } else if (stats.isDirectory()) {
      fs.readdir(filePath, (err, files) => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        const data = {
          files: files,
          title: path.basename(filePath),
          dir: path.relative(config.root, filePath)
        }
        res.end(template(data))
      })
    }
  })
})

server.listen(config.port, config.hostname, () => {
  const addr = `http://${config.hostname}:${config.port}`
  console.log(addr)
})
