// Ścieżka: /workspaces/VEXTRO/webapp/src/services/ContactsService.js

const CACHE_KEY = 'vextro_contacts_cache';

const ContactsService = {

  /**
   * Pobiera kontakty z backendu (przez Vite proxy → /api).
   * Offline-first: przy błędzie zwraca localStorage cache.
   */
  async getContacts(ownerPhone) {
    try {
      const res = await fetch(`/api/contacts/${encodeURIComponent(ownerPhone)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error('Network error');
      const data = await res.json();
      const contacts = data.contacts || [];
      localStorage.setItem(CACHE_KEY, JSON.stringify(contacts));
      return contacts;
    } catch {
      console.warn('📡 [Contacts] Fallback to cache');
      return this.getCachedContacts();
    }
  },

  getCachedContacts() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Dodaje kontakt — backend weryfikuje czy numer istnieje w VEXTRO.
   * @returns {{ success: boolean, contact?: object, error?: string }}
   */
  async addContact(ownerPhone, contactPhone, displayName = '') {
    try {
      const res = await fetch('/api/contacts/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerPhone, contactPhone, displayName }),
        signal: AbortSignal.timeout(10000),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error || 'Błąd serwera.' };
      localStorage.removeItem(CACHE_KEY);
      return { success: true, contact: data.contact };
    } catch {
      return { success: false, error: 'Brak połączenia z siecią VEXTRO.' };
    }
  },

  async removeContact(ownerPhone, contactPhone) {
    try {
      await fetch('/api/contacts/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerPhone, contactPhone }),
      });
      localStorage.removeItem(CACHE_KEY);
      return { success: true };
    } catch {
      return { success: false };
    }
  },
};

export default ContactsService;
