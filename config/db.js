
// const mongoose = require("mongoose");

// const config = require("config");

// const db= config.get("mongoConnectionString");// to connect to mongodb atlas

// const  connectDB = async()=>{
//     try{
//         await mongoose.connect(db);
//         console.log("connected to mongodb");
//     }catch(err){
//         console.log(err.message);
//         process.exit(1);
//     }
   
// }
// module.exports = connectDB; 
const mongoose = require("mongoose");

require('dotenv').config(); // Load environment variables from .env file

const db = process.env.MONGO_CONNECTION_STRING;

const connectDB = async () => {
    try {
        await mongoose.connect(db);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
