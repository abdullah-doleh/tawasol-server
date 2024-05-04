const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");

const app = express();


app.use(express.json());//convert to json body pareser
app.use(cors());//to allow access from outside the server
app.use("/api/users",require("./routes/users"));
app.use("/api/profiles",require("./routes/profiles"));
const helmet = require("helmet");
app.use("/api/posts",require("./routes/posts"));

  
connectDB();

app.use(express.static(__dirname+'/public'))

app.use(
    helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'none'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts
          // Add more directives as needed
        },
      }))
  


app.get("/",(req,res)=>
    res.send("server is working"));

const PORT =process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server has started on port ${PORT}`)
});