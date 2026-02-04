export function isAdmin(req, res, next) {
    if (req.usuario.is_admin !== 1) {
        return res.status(403).json({
            erro: 'Acesso restrito a administradores'
        });
    }
    next();
}
