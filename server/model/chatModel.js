import mongoose from "mongoose";

const chatSchema =  mongoose.Schema({
    userFirstName: {
        type: String,
        required: false
    },
    userLastName: {
        type: String,
        required: false
    },
    userProfilePic: {
        type: String,
        required: false
    },
    coachFirstName: {
        type: String,
        required: false
    },
    coachLastName: {
        type: String,
        required: false
    },
    coachProfilePic: {
        type: String,
        required: false
    },
    date: {
        type: Date,
        default: Date.now  // Ensure that the default is a function that returns the current date
    },
    type: {
        type: String,
        required: true,
        enum: ['user', 'coach']  // Assuming messages can be of type 'sender' or 'receiver'
    },
    userID: {
        type:String, // Reference to User model if exists
        required: true
    },
    coachID: {
        type:String, // Reference to User model if exists
        required: true
    },
    message: {
        type: String,
        required: false
    }
});

const Chat = mongoose.model('chat', chatSchema);
export default Chat;
