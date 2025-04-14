import mongoose from "mongoose";
import colors from "colors"; // Ensure you install it: npm install colors

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined in environment variables");
        }
        
        const connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ Connected to MongoDB: ${connection.connection.host}`.magenta.bold);
    } catch (error) {
        console.log('error: ', error);
        console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
        process.exit(1); // Exit process with failure
    }
};

export default connectDB;
