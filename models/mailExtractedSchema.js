import mongoose from 'mongoose';

const newSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  messagesTotal: {
    type: Number,
    require: true,
    default: 0,
  },
  recievedEmails: [
    {
      subject: { type: String },
      body: { type: String },
      attachments: [String],
      from: { type: String },
    },
  ],
});

const emailCollection = mongoose.model('email_collection', newSchema);

export default emailCollection;
