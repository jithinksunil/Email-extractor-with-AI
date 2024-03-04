import mongoose from "mongoose"

const newSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    name:{
        type:String,
        require:true
    },
    password: {
        type: String,
        required: true
    },
    genaratedPasswords: [{
        type: String
    }]
})

const userCollection = mongoose.model('user_collection', newSchema)

export default userCollection
