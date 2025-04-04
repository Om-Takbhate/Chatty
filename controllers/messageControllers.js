const Chat = require("../models/chatModel")
const Message = require("../models/messageModel")
const User = require("../models/userModel")

const sendMessage = async(req,res,next) => {
    try {
        const {content, chatId} = req.body
        if(!content || !chatId) {
            return res.status(400).send('Invalid data passed')
        }

        let newMessage = {
            sender: req.user?._id,
            content,
            chat: chatId
        }

        let message = await Message.create(newMessage)

        message = await message.populate('sender','name pic')
        message = await message.populate('chat')
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'name pic email'
        })
        


        await Chat.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message._id,
        })


        await message.save()

        res.json(message)

        
    }
    catch(err) {
        console.log(err)
        return res.status(400).send(err.message)
    }
}

const allMessages = async(req,res) => {
    try {
        const chatId = req.params?.chatId

        const messages = await Message.find({chat:chatId})
            .populate('sender','name pic email')
            .populate('chat')

        res.json(messages)

    }   
    catch(err) {
        res.status(400).send(err.message)
    }
}


module.exports = {
    sendMessage, 
    allMessages
}