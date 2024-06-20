const express = require('express');
const router = express.Router();
const multer = require('multer');

const PostController = require('../controllers/post');
const auth = require('../middlewares/auth');

// Uploload Files Setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/posts/")
    },
    filename: (req, file, cb) => {
        cb(null, "post-" + Date.now() + '-' + file.originalname)
    }
});

const uploads = multer({ storage });

router.post("/save", auth.validateToken, PostController.save);
router.get("/detail/:id", auth.validateToken, PostController.detail);
router.get("/user/:id/:page?", auth.validateToken, PostController.userPosts);
router.delete("/remove/:id", auth.validateToken, PostController.remove);
router.post("/upload/:id", [auth.validateToken, uploads.single("imgPost")], PostController.uploadImg);
router.get("/img/:file", PostController.displayImg);
router.get("/feed/:page?", auth.validateToken, PostController.feed);


module.exports = router;