const mongoose  = require('mongoose')

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        trim: true,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
        enum: {
            values: [true, false],
            message: "isGroupChat field must be either true or false"
        }
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

}, {timestamps: true})

const Chat = mongoose.model('Chat',chatSchema)


module.exports = Chat
