import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js'

const identificarUsuario = async (req, res, next) => {
    //Identificar si hay un token
    const {_token} =  req.cookies
    if(!_token) {
        req.usuario = null //En caso de que no esté autenticado
        return next();
    }
    //Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)

        if (usuario) {
            req.usuario = usuario //Se extrae el usuario
        }
        return next();//En caso de que no exista el usuario se envia al siguiente middleware
    }catch (error) {
        console.log(error)
        return res.clearCookie('_token').redirect('/auth/login')
    }
}

export default identificarUsuario;