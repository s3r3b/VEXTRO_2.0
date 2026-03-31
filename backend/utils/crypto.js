// 1. Dodaj import na samej górze (pod innymi require)
const { encryptData, decryptData } = require('./utils/crypto');

// ... (reszta kodu bez zmian aż do io.on)

io.on('connection', (socket) => {
    console.log(`Użytkownik połączony: ${socket.id}`);

    socket.on('send_message', (data) => {
        // 2. Szyfrujemy wiadomość przed wysłaniem jej w świat
        const encryptedMsg = encryptData(data.content);
        
        console.log("Oryginał:", data.content);
        console.log("Zaszyfrowane:", encryptedMsg);

        // Wysyłamy do innych zaszyfrowaną wersję!
        socket.broadcast.emit('receive_message', {
            sender: data.sender,
            content: encryptedMsg
        });
    });
});