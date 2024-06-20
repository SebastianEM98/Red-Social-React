const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate-v2');
const fs = require('fs');
const path = require('path');

// Models Import
const User = require('../models/user');
const Follow = require('../models/follow');
const Post = require('../models/post');

// Services Import
const jwt = require('../services/jwt');
const followService = require('../services/followService');
const validate = require('../helpers/validate');


const register = (req, res) => {
    const params = req.body;

    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }
    
    try {
        validate(params);
    } catch(error) {
        return res.status(400).send({
            status: "error",
            message: "Hay uno o varios campos que no son validos"
        });
    }


    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).exec().then(async (users) => {
        if (users && users.length > 0) {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        // Password Hash
        const hashedPassword = await bcrypt.hash(params.password, 10);
        params.password = hashedPassword;

        let user_to_save = new User(params);

        user_to_save.save().then((userStored) => {

            if (!userStored) {
                return res.status(500).send({
                    status: "error",
                    message: "Error al crear el usuario"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "Usuario registrado con éxito",
                user: userStored
            });

        }).catch((error) => {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya se encuentra registrado",
                error
            });
        });
    });
}


const login = async (req, res) => {
    const params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        const user = await User.findOne({ email: params.email });

        if (!user) {
            return res.status(404).send({
                status: "error",
                message: "Las credenciales ingresadas no son correctas"
            });
        }

        const validPassword = bcrypt.compareSync(params.password, user.password);

        if (!validPassword) {
            return res.status(400).send({
                status: "error",
                message: "Las credenciales ingresadas no son correctas"
            });
        }

        const token = jwt.createToken(user);

        return res.status(200).send({
            status: "success",
            message: "Inicio de sesion correcto",
            token,
            user: {
                id: user._id,
                name: user.name,
                nick: user.nick
            }
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Ha ocurrido un error al iniciar sesión",
            error
        });
    }
}


const profile = (req, res) => {
    const id = req.params.id;

    User.findById(id).select({ password: 0, role: 0 }).then(async (userProfile) => {
        if (!userProfile) {
            return res.status(404).send({
                status: "error",
                message: "El usuario no existe"
            });
        }

        // Following information
        const followInfo = await followService.followingThisUser(req.user.id, id);

        return res.status(200).send({
            status: "success",
            user: userProfile,
            following: followInfo.following,
            follower: followInfo.follower
        });
    });
}


const list = async (req, res) => {
    const defaultPage = 1;
    const page = req.params.page ? parseInt(req.params.page) : defaultPage;

    let itemsPerPage = 5;

    const options = {
        page: page,
        limit: itemsPerPage,
        sort: { created_at: -1 },
        select: "-password -email -role -__v"
    };

    try {

        const users = await User.paginate({}, options);

        if (!users) {
            return res.status(404).send({
                status: "error",
                message: "No hay usuarios disponibles"
            });
        }

        // Array of users I follow and users that follows me
        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            page,
            itemsPerPage,
            totalPages: users.totalPages,
            totalUsers: users.totalDocs,
            users: users.docs,
            user_following: followUserIds.following,
            user_following_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(404).send({
            status: "error",
            message: "Hubo un error al obtener los usuarios",
            error: error.message
        });
    }
}

const update = (req, res) => {
    let userIdentity = req.user;
    let userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.avatar;

    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec().then(async (users) => {

        let existingUser = false;

        users.forEach(user => {
            if (user && user._id != userIdentity.id) {
                existingUser = true;
            }
        });

        if (existingUser) {
            return res.status(400).send({
                status: "error",
                message: "El usuario ya existe"
            });
        }

        // Password Hash
        if (userToUpdate.password) {
            const hashedPassword = await bcrypt.hash(userToUpdate.password, 10);
            userToUpdate.password = hashedPassword;
        } else {
            delete userToUpdate.password;
        }


        try {
            const updatedUser = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true });

            if (!updatedUser) {
                return res.status(400).send({
                    status: "error",
                    message: "El usuario a modificar no existe"
                });
            }

            return res.status(200).send({
                status: "success",
                message: "Usuario Actualizado",
                user: updatedUser
            });

        } catch (error) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar el usuario"
            });
        }
    });
}

const uploadAvatar = (req, res) => {

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

    User.findOneAndUpdate({ _id: req.user.id }, { avatar: req.file.filename }, { new: true }).then((updatedUserAvatar) => {

        if (!updatedUserAvatar) {
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar el avatar"
            });
        }

        let oldImage = req.user.avatar;

        if (oldImage != "default.png") {
            const oldFilePath = "./uploads/avatars/" + oldImage;
            fs.unlinkSync(oldFilePath);
        }

        const newToken = jwt.createToken(updatedUserAvatar);

        return res.status(200).send({
            status: "success",
            message: "Avatar actualizado",
            newToken,
            user: updatedUserAvatar,
            file: req.file,
        });
    });
}

const displayAvatar = (req, res) => {
    const file = req.params.file;
    const filePath = "./uploads/avatars/" + file;

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

const counters = async (req, res) => {

    let userId = req.user.id;

    if (req.params.id) userId = req.params.id;

    try {
        const following = await Follow.countDocuments({ "user": userId });

        const followers = await Follow.countDocuments({ "followed": userId });

        const posts = await Post.countDocuments({ "user": userId });

        return res.status(200).send({
            status: "success",
            userId,
            following: following,
            followers: followers,
            posts: posts
        });

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en los contadores",
            error: error.message
        });
    }
}

module.exports = {
    register,
    login,
    profile,
    list,
    update,
    uploadAvatar,
    displayAvatar,
    counters
}