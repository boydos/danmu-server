'use strict'
const userController = require('../../../controllers/UserController')
const log = require('../../../utils/log')
let config = require('../../../../config')

module.exports = function (app) {
  app.post('/manage/block/add/', (req, res) => {
    let room = req.body.room
    userController.block(room, req.body.user)
    res.end('{"error": "封禁用户成功"}')
  })

  app.post('/manage/block/get/', (req, res) => {
    let room = req.body.room
    log.log('请求被封禁用户成功')
    res.end(JSON.stringify(config.rooms[room].blockusers))
  })

  app.post('/manage/block/remove/', (req, res) => {
    let room = req.body.room
    userController.unblock(room, req.body.user)
    res.end('{"error": "移除封禁成功"}')
  })
}
