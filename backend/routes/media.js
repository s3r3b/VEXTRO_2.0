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

/**
 * POST /api/media/transcribe
 * Mock-up silnika Whisper. W wersji produkcyjnej tu uderzamy do OpenAI lub lokalnego modelu.
 */
router.post('/transcribe', upload.single('file'), (req, res) => {
    // Symulacja czasu pracy sieci neuronowej
    const mockTranscriptions = [
        "Jasne, rozumiem. Przesyłam potwierdzenie.",
        "Spotkanie o 10:00 w kwaterze głównej.",
        "Protokół Shield został aktywowany pomyślnie.",
        "VEXTRO to przyszłość bezpiecznej komunikacji."
    ];

    const randomText = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];

    setTimeout(() => {
        res.json({ text: `[ANTIVOICE_TRANSCRIPTION]: ${randomText}` });
    }, 1500);
});

module.exports = router;
