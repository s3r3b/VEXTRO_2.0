// Ścieżka: /workspaces/VEXTRO/webapp/src/services/apiService.js
import NetworkConfig from './NetworkConfig';

export const apiService = {
  uploadKeys: async (bundle) => {
    const url = `${NetworkConfig.getApiBase()}/keys/upload`;
    console.log("🔑 [API] Wysyłam paczkę X3DH pod:", url);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bundle),
    });
    if (!response.ok) throw new Error(`Failed to upload keys: ${response.statusText}`);
    return response.json();
  },

  fetchReceiverKeys: async (phone) => {
    const response = await fetch(`${NetworkConfig.getApiBase()}/keys/fetch/${phone}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to fetch keys: ${response.statusText}`);
    return response.json();
  },

  sendMessage: async (payload) => {
    const response = await fetch(`${NetworkConfig.getApiBase()}/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Failed to send message: ${response.statusText}`);
    return response.json();
  },

  retrieveMessages: async (phone) => {
    const response = await fetch(`${NetworkConfig.getApiBase()}/messages/retrieve/${phone}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`Failed to retrieve messages: ${response.statusText}`);
    return response.json();
  }
};

export default apiService;