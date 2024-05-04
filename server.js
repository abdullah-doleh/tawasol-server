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

// Middleware to generate a unique nonce value for each request
app.use((req, res, next) => {
    // Generate nonce for the current request
    const nonce = crypto.randomBytes(16).toString('base64');
    // Set nonce in locals to access it in routes
    res.locals.nonce = nonce;
    // Call next middleware
    next();
});

// Construct Content Security Policy (CSP) meta tag with nonce
const cspMetaTag = (req, res, next) => {
    // Get nonce from locals
    const nonce = res.locals.nonce;
    // Construct CSP header with the nonce
    res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'self' 'nonce-${nonce}'`);
    // Call next middleware
    next();
};

// Routes setup
app.use("/api/users", cspMetaTag, require("./routes/users"));
app.use("/api/profiles", cspMetaTag, require("./routes/profiles"));
app.use("/api/posts", cspMetaTag, require("./routes/posts"));

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
