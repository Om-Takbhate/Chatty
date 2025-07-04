const User = require('../models/userModel')
const generateToken = require('../config/generateToken')


const registerUser = async (req, res, next) => {
    try {

        const { name, email, password, pic } = req.body

        if (!name || !email || !password) {
            res.status(400);

            throw new Error("Please enter all fields")
        }

        const userExists = await User.findOne({ email })

        if (userExists) {
            res.status(400);

            throw new Error("User already exists!")
        }

        const user = await User.create({
            name, email, password, pic
        })

        if (user) {
            res.status(200).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            })
        }

        else {
            res.status(400);
            throw new Error("Failed to create the user")
        }
    }
    catch (err) {
        next(err)
    }
    
}


const authUser = async (req, res, next) => {
    try {
        const {email, password} = req.body

        const user = await User.findOne({email})

        if(!user) return res.status(404).send('No user found')



        if(user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                pic: user.pic,
                token: generateToken(user._id)
            })
        }
        else {
            res.status(401).send("Invalid credentials")
        }

    }
    catch (err) {
        next(err)        
    }
}


// api/user?search=piyush
const allUsers = async(req,res,next) => {
    try {
        const keyword = req.query?.search ? {
            $or: [
                {name: {$regex: req.query?.search, $options: "i"}},
                {email: {$regex: req.query?.search, $options: "i"}}
            ]
        } : {};

        const users = await User.find(keyword).find({_id: {$ne: req.user?._id}})

        res.send(users)

        
    }
    catch(err) {
        next(err)

    }
}


module.exports = {
    registerUser,
    authUser,
    allUsers
}