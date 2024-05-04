const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");
const helmet = require('helmet');
const crypto = require('crypto');
const ejs = require('ejs'); // Import EJS module

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware setup
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to generate a unique nonce value for each request
app.use((req, res, next) => {
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.nonce = nonce;
    next();
});

// Construct Content Security Policy (CSP) meta tag with nonce
const cspMetaTag = (req, res, next) => {
    const nonce = res.locals.nonce;
    res.setHeader('Content-Security-Policy', `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'safe-inline'`);
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
  // Render the HTML template with the nonce value injected
  res.render('index', { nonce: res.locals.nonce });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server has started on port ${PORT}`);
});
