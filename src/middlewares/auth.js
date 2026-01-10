import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function auth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: 'token ausente' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ erro: 'token mal formatado' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
        return res.status(401).json({ erro: 'token mal formatado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.usuario = decoded;
        return next();
    } catch (err) {
        console.log('JWT ERROR 👉', err.message);
        return res.status(401).json({ erro: 'token inválido' });
    }
}
