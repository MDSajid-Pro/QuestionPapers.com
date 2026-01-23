import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import path from 'path';

// 1. Load environment variables
dotenv.config();

// 2. Configure Cloudinary with your credentials
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 3. Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // --- NAMING LOGIC START ---
        
        // Clean the original name (remove special chars)
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const nameWithoutExt = path.parse(cleanName).name;
        
        // Add timestamp for uniqueness
        const uniqueSuffix = Date.now();
        
        // --- NAMING LOGIC END ---

        return {
            folder: 'question-papers', // The folder name in your Cloudinary Dashboard
            resource_type: 'auto',     // 'auto' detects that it is a PDF
            format: 'pdf',             // Force PDF format
            public_id: `${nameWithoutExt}-${uniqueSuffix}`, // The filename (without extension)
        };
    },
});

// 4. File Filter (PDF Only) - Kept same as before
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// 5. Initialize Multer
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
});

export default upload;