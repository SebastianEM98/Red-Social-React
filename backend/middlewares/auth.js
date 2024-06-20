const jwt = require('jwt-simple');
const moment = require('moment');

const jwtService = require('../services/jwt');
const SECRET_KEY = jwtService.JWT_SECRET_KEY;

exports.validateToken = (req, res, next) => {

    const headerToken = req.headers.authorization;

    if (!headerToken) {
        return res.status(401).send({
            status: "error",
            message: "Acceso denegado",
            headers: req.headers
        });
    }

    let bearerToken = headerToken.replace(/['"]+/g, '');

    try {
        let payload = jwt.decode(bearerToken, SECRET_KEY);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                status: "error",
                message: "La sesión ha expirado",
                error
            });
        }

        req.user = payload;

    } catch (error) {
        return res.status(401).send({
            status: "error",
            message: "Token invalido"
        });
    }

    next();
}