import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import NetworkConfig from './NetworkConfig';

const CACHE_KEY = 'vextro_groups_cache';

const GroupService = {
  async getGroups(userPhone) {
    try {
      const res = await axios.get(
        `${NetworkConfig.BASE_URL}/api/groups/${encodeURIComponent(userPhone)}`,
        { timeout: 8000 }
      );
      const groups = res.data.groups || [];
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(groups));
      return groups;
    } catch (err) {
      console.warn('📡 [Groups] Sieć niedostępna — ładowanie list z cache');
      return this.getCachedGroups();
    }
  },

  async getCachedGroups() {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
};

export default GroupService;
