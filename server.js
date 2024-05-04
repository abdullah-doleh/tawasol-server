const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const connectDB = require("./config/db");
const crypto = require('crypto');
const app = express();
const nonce = crypto.randomBytes(16).toString('base64');

// Middleware setup
app.use(express.json()); // JSON body parser
app.use(cors()); // CORS middleware
app.use(helmet()); // Helmet middleware for general security headers

// Content Security Policy (CSP) setup
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'none'"], // Default source to none
        scriptSrc: ["'self'"], // Allow scripts from the same origin
        // Add the nonce value to the script-src directive
        scriptSrc: ["'self'", `'nonce-${nonce}'`],
        // Add more directives as needed
      },
    })
  );

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
