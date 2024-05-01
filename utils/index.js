// const multer = require("multer");
// const jwt = require("jsonwebtoken");
// const config = require("config");
//  // Generate a unique nonce value

// const auth = (req, res, next) => {
//     // Get token from the request header
//     const token = req.header("x-auth-token");
//     if (!token) {
//         return res.status(401).json({ msg: "Token is not available, authentication denied" });
//     }
//     try {
//      // Generate a unique nonce value
//         const decoded = jwt.verify(token, config.get("jwtSecret"));
//         const nonce = generateNonce(); // Generate a unique nonce value
//         res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'`);
//         req.user = decoded.user;
//         next(); // Call next middleware
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ msg: "Server error" });
//     }
// };

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "public/images");
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${req.user.id}`);
//     }
// });

// const upload = multer({ storage: storage }).single("file");

// module.exports = { auth, upload };

const multer = require("multer");
const jwt = require("jsonwebtoken");
const config = require("config");

// Generate a unique nonce value
function generateNonce(length = 16) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < length; i++) {
        nonce += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return nonce;
}

const auth = (req, res, next) => {
    // Get token from the request header
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ msg: "Token is not available, authentication denied" });
    }
    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
        // Generate a unique nonce value
        const nonce = generateNonce();
        // Set the Content Security Policy (CSP) header
        res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'`);
        req.user = decoded.user;
        next(); // Call next middleware
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}`);
    }
});

const upload = multer({ storage: storage }).single("file");

module.exports = { auth, upload };
