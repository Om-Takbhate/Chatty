const Chat = require('../models/chatModel')
const User = require('../models/userModel')

const accessChat = async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        return res.status(400).send('Pls send the user id to chat with')
    }

    let isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req?.user?._id } } },
            { users: { $elemMatch: { $eq: userId } } }
        ]
    }).populate('users', "-password").populate("latestMessage")


    isChat = await User.populate(isChat, {
        path: 'latestMessage.sender',
        select: "name pic email"
    })


    if (isChat.length > 0) {
        return res.send(isChat[0])
    }

    else {
        let chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user?._id, userId]
        }
        try {
            const createdChat = await Chat.create(chatData)

            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")

            res.status(200).send(fullChat)
        }
        catch (err) {
            next(err)
        }
    }


}


const fetchChats = async (req, res, next) => {
    try {
        let chats = await Chat.find({users: {$elemMatch: {$eq: req.user?._id}}})
            .populate("users","-password")
            .populate("groupAdmin")
            .populate("latestMessage")

        chats = await User.populate(chats, {
            path: 'latestMessage.sender',
            select: "name pic email"
        })


        res.send(chats)
    }
    catch (err) {
        next(err)
    }
}


const createGroupChat = async(req,res,next)=>{
    if(!req.body.users || !req.body.name) {
        return res.status(400).send("Please fill out all details")
    }

    let users = JSON.parse(req.body.users)

    if(users.length < 2) {
        return res.status(400).send("Group must have atleast 2 users")
    }

    users.push(req.user)

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            groupAdmin: req.user?._id,
            isGroupChat: true
        })

        const fullGroupChat = await Chat.find({_id: groupChat._id})
            .populate("users","-password")
            .populate("groupAdmin", "-password")


        res.status(400).json(fullGroupChat)
    } catch (error) {
        next(err)
    }

}


const renameGroup = async(req,res,next) => {
    const {chatId, chatName} = req.body

    try {
        const updatedChat = await Chat.findByIdAndUpdate(chatId, {chatName}, {
            new: true
        })
            .populate("users","-password")
            .populate("groupAdmin","-password")

        
        if(!updatedChat) {
            return res.status(404).send("Group not found")
        }

        res.json(updatedChat)

    }
    catch(err) {
        next(err)
    }
}

const addToGroup = async(req,res,next) => {
    const {chatId, userId} = req.body

    try {
        const added = await Chat.findByIdAndUpdate(chatId,{
            $push: {
                users: userId
            }
        },{new: true})
            .populate("users","-password")
            .populate("groupAdmin","-password")

        if(!added) {
            return res.status(400).send("Chat not found")
        }

        else {
            res.json(added)
        }


    }
    catch(err) {
        next(err)
    }
}

const removeFromGroup = async(req,res,next) => {
    const {chatId, userId} = req.body

    try {
        const removed = await Chat.findByIdAndUpdate(chatId,{
            $pull: {
                users: userId
            }
        },{new: true})
            .populate("users","-password")
            .populate("groupAdmin","-password")

        if(!removed) {
            return res.status(400).send("Chat not found")
        }

        else {
            res.json(removed)
        }


    }
    catch(err) {
        next(err)
    }
}



module.exports = {
    accessChat,
    fetchChats,
    createGroupChat,
    renameGroup,
    addToGroup,
    removeFromGroup
}