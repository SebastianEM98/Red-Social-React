const mongoosePaginate = require('mongoose-paginate-v2');

// Models Import
const Follow = require('../models/follow');
const User = require('../models/user');

// Services Import
const followService = require('../services/followService');

const saveFollow = (req, res) => {

    const params = req.body;
    const identity = req.user;

    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    userToFollow.save().then((followStored) => {
        if (!followStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido seguir al usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            identity: req.user,
            follow: followStored
        });
    });
}

const unfollow = (req, res) => {
    const userId = req.user.id;
    const followedId = req.params.id;

    Follow.findOneAndDelete({
        "user": userId,
        "followed": followedId
    }).then((followDeleted) => {

        if (!followDeleted) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido dejar de seguir el usuario"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Follow eliminado correctamente"
        });
    });
}

// Makes a List of users that a certain user is following
const following = async (req, res) => {

    let userId = req.user.id;
    let page = 1;
    let itemsPerPage = 5;

    if (req.params.id) userId = req.params.id;

    if (req.params.page) page = parseInt(req.params.page);

    const options = {
        // select: "name password",
        page: page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        populate: [{
            path: "user followed",
            select: "-password -email -role -__v"
        }]
    };

    try {
        const follows = await Follow.paginate({ user: userId }, options);

        if (!follows) {
            return res.status(400).send({
                status: "error",
                message: "No hay usuarios seguidos"
            });
        }

        // Array of users I follow and users that follows me
        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            page,
            totalPages: follows.totalPages,
            totalFollows: follows.totalDocs,
            follows: follows.docs,
            user_following: followUserIds.following,
            user_following_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al obtener los usuarios seguidos",
            error: error.message
        });
    }
}


// Makes a list of users that are following a certain user
const followers = async (req, res) => {

    let userId = req.user.id;
    let page = 1;
    let itemsPerPage = 5;

    if (req.params.id) userId = req.params.id;

    if (req.params.page) page = parseInt(req.params.page);

    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        populate: [{
            path: "user",
            select: "-password -email -role -__v"
        }]
    };

    try {
        const followers = await Follow.paginate({ followed: userId }, options);

        if (!followers) {
            return res.status(400).send({
                status: "error",
                message: "No tienes seguidores"
            });
        }

        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que me siguen",
            page,
            totalPages: followers.totalPages,
            totalFollows: followers.totalDocs,
            followers: followers.docs,
            user_following: followUserIds.following,
            user_following_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al obtener los seguidores",
            error: error.message
        });
    }
}


module.exports = {
    saveFollow,
    unfollow,
    following,
    followers
}