module.exports = function registerHealthRoutes(app) {
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
  })
}
