import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

/* 🔎 DEBUG — NÃO REMOVE AGORA */
console.log('☁️ CLOUDINARY ENV CHECK ☁️');
console.log('CLOUD NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API KEY:', process.env.CLOUDINARY_API_KEY);
console.log(
    'API SECRET:',
    process.env.CLOUDINARY_API_SECRET ? 'OK' : 'MISSING'
);

/* 🔧 CONFIG CLOUDINARY */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* 📦 STORAGE */
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'devburger/produtos',
        allowed_formats: ['jpg', 'jpeg', 'png'],
    },
});

export const uploadCloud = multer({ storage });
