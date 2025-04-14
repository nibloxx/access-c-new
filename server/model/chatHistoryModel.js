import mongoose from 'mongoose';

const chatHistorySchema =  mongoose.Schema({
    chatID: String,
    firstName: String,
    date: Date,
    type: String,
    profilePic: {
        type: String,
        required: false
    },
    message: String,
    coachID: mongoose.Schema.Types.ObjectId,
    senderID: mongoose.Schema.Types.ObjectId
});

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;