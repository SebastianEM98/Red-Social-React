const jwt = require('jwt-simple');
const moment = require('moment');

// JWT Secret Key
const JWT_SECRET_KEY = "aVu!DT6WL=FmsbN$eG%o";

const createToken = (user) => {
    const payload = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    }

    return jwt.encode(payload, JWT_SECRET_KEY);
}

module.exports = {
    JWT_SECRET_KEY,
    createToken
} 