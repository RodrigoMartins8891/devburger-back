import multer from 'multer';
import path from 'path';

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/');
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const nome = `${Date.now()}-${Math.random()}${ext}`;
            cb(null, nome);
        }
    }),
    fileFilter: (req, file, cb) => {
        const tipos = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!tipos.includes(file.mimetype)) {
            return cb(new Error('Arquivo inválido'));
        }
        cb(null, true);
    }
});
