
const mongoose = require("mongoose");

const config = require("config");

const db= config.get("mongoConnectionString");// to connect to mongodb atlas

const  connectDB = async()=>{
    try{
        await mongoose.connect(db);
        console.log("connected to mongodb");
    }catch(err){
        console.log(err.message);
        process.exit(1);
    }
   
}
module.exports = connectDB;
