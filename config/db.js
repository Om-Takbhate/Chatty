const mongoose = require('mongoose')

const connectToDb = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI)

    }
    catch(err) {    
        console.error(err);
        process.exit()

    }
}
module.exports = connectToDb