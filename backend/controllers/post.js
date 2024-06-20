const mongoosePaginate = require('mongoose-paginate-v2');
const fs = require('fs');
const path = require('path');

// Models Import
const Post = require('../models/post');

// Services Import
const followService = require('../services/followService');


const save = (req, res) => {

    const params = req.body;

    if (!params.text) {
        return res.status(400).send({
            status: "error",
            message: "Faltan campos por completar"
        });
    }

    let newPost = new Post(params);
    newPost.user = req.user.id;

    newPost.save().then((postStored) => {

        if (!postStored) {
            return res.status(500).send({
                status: "error",
                message: "No se ha podido guardar la publicación"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicación guardada",
            post: postStored
        });
    });
}

const detail = (req, res) => {
    const postId = req.params.id;

    if (postId.length < 24 || postId.length > 24) {
        return res.status(404).send({
            status: "error",
            message: "El ID de la publicación no es valido"
        });
    }

    Post.findById(postId).then((postDetail) => {
        if (!postDetail) {
            return res.status(404).send({
                status: "error",
                message: "La publicación no existe"
            });
        }

        return res.status(200).send({
            status: "success",
            post: postDetail
        });
    });
}

const userPosts = async (req, res) => {

    const userId = req.params.id;
    let page = 1;
    let itemsPerPage = 5;

    if (req.params.page) page = parseInt(req.params.page);

    const options = {
        page: page,
        limit: itemsPerPage,
        sort: "-created_at",
        populate: [{
            path: "user",
            select: "-password -role -__v -email"
        }]
    };

    try {
        const posts = await Post.paginate({ user: userId }, options);

        if (!posts || posts.totalDocs <= 0) {
            return res.status(400).send({
                status: "error",
                message: "No hay publicaciones por mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicaciones del usuario",
            page,
            totalPages: posts.totalPages,
            totalPosts: posts.totalDocs,
            posts: posts.docs
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al obtener las publicaciones del usuario",
            error: error.message
        });
    }
}

const remove = (req, res) => {
    const postId = req.params.id;

    if (postId.length < 24 || postId.length > 24) {
        return res.status(404).send({
            status: "error",
            message: "El ID de la publicación no es valido"
        });
    }

    Post.findOneAndDelete({ "user": req.user.id, "_id": postId }).then((postDeleted) => {
        if (!postDeleted) {
            return res.status(404).send({
                status: "error",
                message: "La publicación a eliminar no existe",
                postDeleted
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Publicación eliminada exitosamente",
            post: postDeleted
        });
    });
}


const uploadImg = (req, res) => {

    const postId = req.params.id;

    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "La petición no incluye la imagen"
        });
    }

    let image = req.file.originalname;
    const imageSplit = image.split("\.");
    const imageExtension = imageSplit[1];

    if (imageExtension != "png" && imageExtension != "jpg" && imageExtension != "jpeg") {
        const filePath = req.file.path;
        fs.unlinkSync(filePath);

        return res.status(400).send({
            status: "error",
            message: "Extensión del archivo invailda"
        });
    }

    Post.findOneAndUpdate({ user: req.user.id, _id: postId }, { file: req.file.filename }, { new: true }).then((updatedPostImg) => {

        if (!updatedPostImg) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar el avatar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Imagen de la publicación actualizada",
            post: updatedPostImg,
            file: req.file,
        });
    });
}

const displayImg = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/posts/" + file;

    fs.stat(filePath, (err, exists) => {

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No Existe la imagen"
            });
        }

        return res.sendFile(path.resolve(filePath));
    });
}

// List all posts
const feed = async (req, res) => {

    let page = 1;
    let itemsPerPage = 5;

    if (req.params.page) page = parseInt(req.params.page);

    const options = {
        page: page,
        limit: itemsPerPage,
        sort: "-created_at",
        populate: [{
            path: "user",
            select: "-password -email -role -__v"
        }]
    };

    try {
        const myFollows = await followService.followUserIds(req.user.id);

        const posts = await Post.paginate({ user: myFollows.following }, options);

        if (!posts) {
            return res.status(500).send({
                status: "error",
                message: "No hay publicaciones por mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            message: "Feed de publicaciones",
            page,
            totalPages: posts.totalPages,
            totalPosts: posts.totalDocs,
            following: myFollows.following,
            posts: posts.docs
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "No se ha podido listar las publicaciones"
        });
    }
}

module.exports = {
    save,
    detail,
    userPosts,
    remove,
    uploadImg,
    displayImg,
    feed
}