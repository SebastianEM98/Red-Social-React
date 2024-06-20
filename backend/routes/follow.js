const express = require('express');
const router = express.Router();

const FollowController = require('../controllers/follow');
const auth = require('../middlewares/auth');

router.post("/save", auth.validateToken, FollowController.saveFollow);
router.delete("/unfollow/:id", auth.validateToken, FollowController.unfollow);
router.get("/following/:id?/:page?", auth.validateToken, FollowController.following);
router.get("/followers/:id?/:page?", auth.validateToken, FollowController.followers);



module.exports = router;