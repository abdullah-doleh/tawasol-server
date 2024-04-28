const multer = require("multer");
const jwt = require("jsonwebtoken");
const config = require("config");

const auth = (req, res, next) => {
    // Get token from the request header
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(401).json({ msg: "Token is not available, authentication denied" });
    }
    try {
        const decoded = jwt.verify(token, config.get("jwtSecret"));
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
