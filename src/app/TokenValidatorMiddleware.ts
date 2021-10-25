import {Request, Response} from 'express'

const configToken = process.env.TOKEN;
const validateToken = (req: Request, res: Response, next) => {

    // validación del token
    const bodyToken = req.body['token'];
    if (bodyToken != configToken) {
        res.json({status: 'invalid token'})
        next();
        return;
    }

    next();
}

export default validateToken
