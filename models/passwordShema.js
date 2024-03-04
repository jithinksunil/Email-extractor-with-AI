import mongoose, { Types } from "mongoose"

const newSchema = new mongoose.Schema({
    password: {
        type: String,
        required: true
    },
    user:Types.ObjectId
})

const passwordCollection = mongoose.model('password_collection', newSchema)

export default passwordCollection
