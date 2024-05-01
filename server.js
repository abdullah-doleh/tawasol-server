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
const bodyParser = require("body-parser"); // Import bodyParser

const app = express(); // Declare app here

app.use(bodyParser.urlencoded({ extended: false }));

// Generate a unique nonce value for each request
const generateNonce = () => {
    return crypto.randomBytes(16).toString('base64');
};

// Generate nonce for the current request
const nonce = generateNonce();
app.use((req, res, next) => {
    res.locals.nonce = nonce;
    next();
});

const inlineScript = "console.log('Hello, world!');";

// Generate the SHA-256 hash of the inline script
const hash = crypto.createHash('sha256').update(inlineScript).digest('base64');

// Construct the CSP meta tag with the generated hash
const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'sha256-${hash}'">`;

app.use((req, res, next) => {
    res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'nonce-${res.locals.nonce}'`
    );
    next();
});

app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"], // Allow resources from the same origin
        scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts (unsafe)
        // Add other directives as needed
    },
}));

console.log(`Inline script hash: ${hash}`);

const inlineScriptContent = "console.log('Your inline script content here');";
const inlineScriptHash = `'sha256-${crypto.createHash('sha256').update(inlineScriptContent).digest('base64')}'`;

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
