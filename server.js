// const cors = require("cors");
// const express = require("express");
// const connectDB = require("./config/db");

// const app = express();

// app.use(express.json());//convert to json body pareser
// app.use(cors());//to allow access from outside the server
// app.use("/api/users",require("./routes/users"));
// app.use("/api/profiles",require("./routes/profiles"));

// app.use("/api/posts",require("./routes/posts"));

  
// connectDB();

// app.use(express.static(__dirname+'/public'))

// app.get("/",(req,res)=>
//     res.send("server is working"));

// const PORT =process.env.PORT || 5000;

// app.listen(PORT,()=>{
//     console.log(`server has started on port ${PORT}`)
// });

const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const crypto = require("crypto");

// Generate the SHA-256 hash
const hash = crypto.createHash('sha256').update(inlineScriptContent).digest('base64');
console.log(`Inline script hash: ${hash}`);

const app = express();

const inlineScriptContent = "console.log('Your inline script content here');";
const inlineScriptHash = `'sha256-${crypto.createHash('sha256').update(inlineScriptContent).digest('base64')}'`;

// Set Content Security Policy (CSP) header with nonce
app.use((req, res, next) => {
   // const nonce = crypto.randomBytes(16).toString('base64');
    res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}'`);
    next();
});

app.use(express.json()); // Convert to JSON body parser
app.use(cors()); // Allow access from outside the server
app.use("/api/users", require("./routes/users"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/posts", require("./routes/posts"));

connectDB();

app.use(express.static(__dirname + '/public'));

app.get("/", (req, res) =>
    res.send("Server is working")
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server has started on port ${PORT}`);
});
