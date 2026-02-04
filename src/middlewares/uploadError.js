export function uploadError(err, req, res, next) {
    console.log('🔥 UPLOAD ERROR 🔥');
    console.log(err);
    console.log(err.message);

    return res.status(500).json({
        erro: 'erro no upload da imagem',
        detalhe: err.message || err
    });
}
