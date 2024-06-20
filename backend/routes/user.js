const express = require('express');
const router = express.Router();
const multer = require('multer');

const UserController = require('../controllers/user');
const auth = require('../middlewares/auth');

// Uploload Files Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars/")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + '-' + file.originalname)
    }
});

const uploads = multer({ storage });

router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", auth.validateToken, UserController.profile);
router.get("/list/:page?", auth.validateToken, UserController.list);
router.put("/update", auth.validateToken, UserController.update);
router.post("/upload", [auth.validateToken, uploads.single("imgAvatar")], UserController.uploadAvatar);
router.get("/avatar/:file", UserController.displayAvatar);
router.get("/counters/:id", auth.validateToken, UserController.counters);


module.exports = router;