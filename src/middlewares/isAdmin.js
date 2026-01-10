export function isAdmin(req, res, next) {
    if (!req.usuario?.is_admin) {
        return res.status(403).json({
            erro: 'acesso restrito a administradores'
        });
    }
    next();
}
