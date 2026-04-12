# VEXTRO - To Be Continued / Audit Log

- `backend/routes/users.js`: Missing API endpoints for X3DH (Double Ratchet) key management. The `User.js` model defines `signedPreKey` and `oneTimePreKeys`, but there is no way for clients to upload, replenish, or fetch PreKey bundles to establish initial E2EE sessions.
- `backend/routes/media.js`: `router.post('/upload')` - Missing authentication and access control. File uploads are open, and the `/uploads/` directory is served statically without any verification of user identity or room access.
- `backend/routes/groups.js`: Missing group key rotation and member management endpoints. The backend stores the initial `members` array with keys, but there is no logic to handle adding/removing members and rotating the Sender Key / envelopes.




- `frontend/src/screens/AccountScreen.js`: Change Alias (STUB) - The "Zmień Identyfikację Węzła" feature uses an empty wrapper `Alert.alert` stating servers are rejecting migration.
- `frontend/src/screens/AccountScreen.js`: Intel Dump - The data export uses a `setTimeout` to simulate file generation, but only displays an `Alert.alert` with key counts rather than actually exporting data to a filesystem.
- `frontend/src/components/NewChatModal.js`: Create Group - `handleCreateGroup` is a stub showing an alert that the group creation function is still under implementation.
- `frontend/src/screens/ChatScreen.js`: Search, Media & Shortcuts - `handleMenuAction` for 'SEARCH', 'MEDIA', and 'ADD_SHORTCUT' are empty wrappers showing `alert` popups (e.g., "Moduł wyszukiwania w budowie.").
- `frontend/src/screens/ChatScreen.js`: AI Module (MOCK) - AI chat responses are hardcoded and triggered by `setTimeout` with a dummy response: "VEXTRO NEURAL_NET odebrało dane. Moduł w budowie."
- `frontend/src/screens/GroupChatScreen.js`: Group Features (STUB) - Similar to ChatScreen, features like group search, encrypted media viewer, and shortcuts are stubbed with `alert` messages claiming they are disabled for vBETA or lack permissions.
- `frontend/src/screens/PrivacyScreen.js`: Blacklist - The "Zakazane Węzły (Blacklist)" option is an empty wrapper triggering `Alert.alert('BLACKLIST', ...)` instead of opening a management screen.

**HIGH PRIORITY:**
- Backend: Implement secure storage and retrieval logic for X3DH PreKey Bundles. Ensure the server acts as a reliable relay for client-side E2EE establishment.