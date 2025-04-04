const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true,"Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email id is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true,"Password is required"]
    },
    pic: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/12225/12225881.png"
    }
}, {timestamps: true})

userSchema.pre('save',async function(next){
    if(!this.isModified) {
        return next()
    }

    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)

})

userSchema.methods.matchPassword = async function(enteredPassword) {
    return (await bcrypt.compare(enteredPassword, this.password))
}

const User = mongoose.model('User',userSchema)

module.exports = User