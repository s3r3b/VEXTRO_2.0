const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Konfiguracja składowania plików (Encrypted Blobs)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * POST /api/media/upload
 * Odbiera zaszyfrowany plik (audio/obraz) i zwraca URL.
 */
router.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Brak pliku w żądaniu.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
        url: fileUrl, 
        originalName: req.file.originalname,
        size: req.file.size
    });
});

module.exports = router;
