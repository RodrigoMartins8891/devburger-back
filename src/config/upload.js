import multer from 'multer';
import path from 'path';

export const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads');
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const nome = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
            cb(null, nome);
        }
    })
});
