import ChatHistory from "../model/chatHistoryModel.js";
import Chat from "../model/chatModel.js";
import User from "../model/userModel.js";


const createChat = async (req, res) => {
   
  try {
    const { coachId, msg, userId } = req.body;


    const existingChat = await Chat.findOne({ coachID: coachId, userID: userId });
    if (existingChat) {
      return res.status(200).json({  // 409 Conflict might be more appropriate here
        status: false,
        message: "Chat already exists between the specified coach and user."
      });
    }


    // Retrieve user data
    const userdata = await User.findOne({ _id: userId });
    const coachdata = await User.findOne({ _id: coachId });

    console.log('userdata: ', userdata);


    const chatData = {
        userFirstName: userdata.firstName,
        userlastName: userdata.lastName,
        userProfilePic:userdata.photo, 
        coachFirstName: coachdata.firstName,
        coachLastName: coachdata.lastName,
        coachProfilePic:coachdata.photo, 
        date: Date.now(),            
        type: "user",
        userID: userId,
        coachID: coachId, 
        message: msg
    };

    // Create a new chat document
    const chating = new Chat(chatData);
    const result = await chating.save();
    console.log('result: ', result);

    res.status(200).json({
      status: true,
      message: "Chat created successfully",
      details: result  // Optionally include details of the created chat
    });
  } catch (error) {
    console.error('Error while creating chat:', error);
    res.status(400).json({
      status: false,
      error: error.message,
    });
  }
};

const chat = async (req, res) => {
    try {
        // Assuming data comes in the body of a POST request
        const { chatID, message, type, userID,} = req.body;
      
         const  data = await User.findOne({ _id: userID });
         console.log('data: ', data);

       
     const obj ={
        chatID:chatID,
        firstName:data.firstName,
        date: Date.now(), // Sets the date when the chat is created
        type:type,
        message:message,
        profilePic:data.photo,
    }
        const newChat = new ChatHistory(obj);
        const savedChat = await newChat.save(); // Save to database

        res.status(200).json({
            status: true,
            details: savedChat 
        });
    } catch (error) {
        console.error('Error while saving chat:', error);
        res.status(500).json({
            status: false,
            error: error.message
        });
    }
};
const getHistory = async (req, res) => {
    try {
        const { id } = req.params; // Assuming senderId is passed as a URL parameter

        // Retrieve chat documents where senderID matches the provided senderId
        const chats = await ChatHistory.find({ "chatID": id });

        if (chats.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No chats found for the given sender ID"
            });
        }

        res.status(200).json({
            status: true,
            message: "Chats retrieved successfully",
            details: chats
        });
    } catch (error) {
        console.error('Error while fetching chats:', error);
        res.status(500).json({
            status: false,
            error: error.message,
        });
    }
};
const getChatsWith = async (req, res) => {
    try {
        const { id } = req.params;
      
        let chats =[]
         chats = await Chat.find({ userID: id });
        if (chats.length === 0) {
             chats = await Chat.find({ coachID: id });

        }
       
        if (chats.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No chats found for the given sender ID"
            });
        }

        res.status(200).json({
            status: true,
            message: "Chats retrieved successfully",
            details: chats
        });
    } catch (error) {
        console.error('Error while fetching chats:', error);
        res.status(500).json({
            status: false,
            error: error.message,
        });
    }
};



  
export {
  createChat,
  getChatsWith,
  chat,
  getHistory
};
