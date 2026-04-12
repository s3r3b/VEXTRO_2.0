import axios from 'axios';
import NetworkConfig from './NetworkConfig';

const CACHE_KEY = 'vextro_groups_cache';

const GroupService = {
  async getGroups(userPhone) {
    try {
      const res = await axios.get(
        `${NetworkConfig.getApiBase()}/groups/${encodeURIComponent(userPhone)}`,
        { 
          timeout: 8000
        }
      );
      const groups = res.data.groups || [];
      localStorage.setItem(CACHE_KEY, JSON.stringify(groups));
      return groups;
    } catch (err) {
      console.warn('📡 [Groups Web] Sieć niedostępna — ładowanie list z cache', err);
      return this.getCachedGroups();
    }
  },

  getCachedGroups() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

export default GroupService;