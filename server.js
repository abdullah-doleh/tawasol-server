const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const crypto = require('crypto'); // Import crypto module once

const app = express();

// Middleware setup
app.use(express.json()); // JSON body parser
app.use(cors()); // CORS middleware
app.use(helmet()); // Helmet middleware for general security headers
app.use(bodyParser.json()); // json is format of the file 

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

// Content Security Policy (CSP) setup

// Routes setup
app.use("/api/users", require("./routes/users"));
app.use("/api/profiles", require("./routes/profiles"));
app.use("/api/posts", require("./routes/posts"));

// Database connection
connectDB();

// Static files
app.use(express.static(__dirname + "/public"));

// Default route
app.get("/", (req, res) => {
  res.send("Server is working");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
