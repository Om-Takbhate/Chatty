const express = require('express')
const protect = require('../middlewares/authMiddleware')
const router = express.Router()
const {sendMessage, allMessages} = require('../controllers/messageControllers')


router.post('/',protect, sendMessage)
router.get('/:chatId',protect, allMessages)

module.exports = router