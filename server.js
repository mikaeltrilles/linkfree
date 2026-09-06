// Serveur HTTP minimal pour l'hébergement cPanel : Apache -> proxy.php -> ici.
const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const port = Number(process.env.PORT) || 3000
const hostname = process.env.HOST || "127.0.0.1"

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true))
  })

  // Les connexions coupées par le proxy PHP ne doivent pas polluer les logs.
  server.on("clientError", (err, socket) => {
    if (err.code !== "ECONNRESET" && socket.writable) {
      socket.end("HTTP/1.1 400 Bad Request\r\n\r\n")
    } else {
      socket.destroy()
    }
  })

  server.keepAliveTimeout = 65000
  server.listen(port, hostname, () => {
    console.log(`> Linkfree prêt sur http://${hostname}:${port} (${dev ? "dev" : "production"})`)
  })
})

process.on("uncaughtException", (err) => {
  if (err && err.code === "ECONNRESET") return
  console.error(err)
  process.exit(1)
})
