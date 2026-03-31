// Ścieżka: /workspaces/VEXTRO/backend/utils/SessionStore.js
const crypto = require('crypto');

/**
 * VEXTRO Premium SessionStore
 * Zarządza aktywnymi sesjami parowania kodem QR (In-Memory).
 * Zapewnia wygasanie kodów i bezpieczne generowanie tokenów.
 */
class SessionStore {
    constructor() {
        this.sessions = new Map();
        this.timeout = 120000; // 120 sekund ważności kodu QR
    }

    /**
     * Inicjalizuje nową sesję oczekującą na autoryzację.
     */
    createSession(socketId) {
        const sessionId = crypto.randomBytes(16).toString('hex');
        
        // Czyścimy stare sesje tego samego socketu, jeśli istnieją
        for (const [id, session] of this.sessions.entries()) {
            if (session.socketId === socketId) {
                this.sessions.delete(id);
            }
        }

        const sessionData = {
            socketId,
            createdAt: Date.now(),
            status: 'awaiting_scan'
        };

        this.sessions.set(sessionId, sessionData);

        // Auto-cleanup po czasie wygaśnięcia
        setTimeout(() => {
            if (this.sessions.has(sessionId)) {
                this.sessions.delete(sessionId);
                console.log(`⌛ [SESSION_STORE] Wygaśnięcie sesji: [${sessionId}]`);
            }
        }, this.timeout);

        return sessionId;
    }

    /**
     * Weryfikuje i autoryzuje sesję.
     */
    authorize(sessionId, userData) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return { success: false, error: 'SESSION_EXPIRED_OR_INVALID' };
        }

        if (session.status !== 'awaiting_scan') {
            return { success: false, error: 'SESSION_ALREADY_PROCESSED' };
        }

        // Aktualizujemy status i dane
        session.status = 'authorized';
        session.userData = userData;

        return { success: true, socketId: session.socketId };
    }

    /**
     * Usuwa sesję po sfinalizowaniu handshake'u.
     */
    destroy(sessionId) {
        return this.sessions.delete(sessionId);
    }
}

module.exports = new SessionStore();
