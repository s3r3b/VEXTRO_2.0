// Ścieżka: /workspaces/VEXTRO/frontend/src/services/ContactsService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetworkConfig from './NetworkConfig';

const CACHE_KEY = 'vextro_contacts_cache';

const ContactsService = {

  /**
   * Pobiera kontakty z backendu i zapisuje do cache.
   * Przy braku sieci zwraca dane z cache (offline-first).
   */
  async getContacts(ownerPhone) {
    try {
      const res = await axios.get(
        `${NetworkConfig.BASE_URL}/api/contacts/${encodeURIComponent(ownerPhone)}`,
        { timeout: 8000 }
      );
      const contacts = res.data.contacts || [];

      // Aktualizuj cache
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(contacts));
      return contacts;
    } catch (err) {
      console.warn('📡 [Contacts] Sieć niedostępna — ładowanie z cache');
      return this.getCachedContacts();
    }
  },

  /**
   * Zwraca kontakty z lokalnego AsyncStorage cache.
   */
  async getCachedContacts() {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Dodaje nowy kontakt po numerze telefonu.
   * Backend weryfikuje czy numer istnieje w VEXTRO.
   * @returns {{ success: boolean, contact?: object, error?: string }}
   */
  async addContact(ownerPhone, contactPhone, displayName = '') {
    try {
      const res = await axios.post(
        `${NetworkConfig.BASE_URL}/api/contacts/add`,
        { ownerPhone, contactPhone, displayName },
        { timeout: 10000 }
      );
      // Unieważnij cache — wymusi fresh fetch przy następnym renderze
      await AsyncStorage.removeItem(CACHE_KEY);
      return { success: true, contact: res.data.contact };
    } catch (err) {
      const msg = err.response?.data?.error || 'Błąd połączenia z siecią VEXTRO.';
      return { success: false, error: msg };
    }
  },

  /**
   * Usuwa kontakt.
   */
  async removeContact(ownerPhone, contactPhone) {
    try {
      await axios.delete(`${NetworkConfig.BASE_URL}/api/contacts/remove`, {
        data: { ownerPhone, contactPhone },
        timeout: 8000,
      });
      await AsyncStorage.removeItem(CACHE_KEY);
      return { success: true };
    } catch {
      return { success: false };
    }
  },

};

export default ContactsService;
