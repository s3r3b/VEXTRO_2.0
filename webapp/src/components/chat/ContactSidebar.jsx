import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VxGearIcon } from '../../components/ui/icons/kinetic';
import { 
  VxRadarIcon, 
  VxBackIcon, 
  VxAvatarIcon, 
  VxNeuralIcon, 
  VxSecurityIcon,
  VxProfileIcon 
} from '../../components/ui/icons/static';
import ContactsService from '../../services/ContactsService';
import GroupService from '../../services/GroupService';
import NetworkConfig from '../../services/NetworkConfig';
import axios from 'axios';
import { useShield } from '../../context/ShieldContext';

export default function ContactSidebar({ onOpenSettings, onSelectContact, activeContactPhone }) {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [myPhone] = useState(() => localStorage.getItem('userPhone') || '');

  // ─── AI CONFIG STATE ───────────────────────────────────────────────────────
  const [aiConfig, setAiConfig] = useState({
    enabled: localStorage.getItem('ai_enabled') === 'true',
    nick: localStorage.getItem('ai_nick') || 'YOUR API CHATBOT AI'
  });

  // Nasłuchuj zmian w localStorage (dla synchronizacji po zamknięciu SettingsModal)
  useEffect(() => {
    const handleStorageChange = () => {
      setAiConfig({
        enabled: localStorage.getItem('ai_enabled') === 'true',
        nick: localStorage.getItem('ai_nick') || 'YOUR API CHATBOT AI'
      });
    };
    window.addEventListener('storage', handleStorageChange);
    // Dodatkowy interwał dla pewności (niektóre przeglądarki nie wyzwalają storage na tej samej karcie)
    const interval = setInterval(handleStorageChange, 1000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // ─── LOGIKA ANIMOWANEGO SZUKANIA (WEB) ──────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // ─── LOAD ────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!myPhone) { setIsLoading(false); return; }
    setIsLoading(true);
    const [cResult, gResult] = await Promise.all([
      ContactsService.getContacts(myPhone),
      GroupService.getGroups(myPhone)
    ]);
    setContacts(cResult);
    setGroups(gResult);
    setIsLoading(false);
  }, [myPhone]);

  useEffect(() => { loadData(); }, [loadData]);

  const combined = [];
  
  // Dodaj AI tylko jeśli jest włączone
  if (aiConfig.enabled) {
    combined.push({
      _id: 'vextro-ai',
      contactPhone: 'AI',
      displayName: aiConfig.nick,
      isAI: true,
      lastMessage: { content: 'Neural engine gotowy.' },
    });
  }

  combined.push(
    ...groups.map(g => ({ ...g, isGroup: true, displayName: g.groupName, contactPhone: g._id })),
    ...contacts
  );

  const filtered = combined.filter(c =>
    c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactPhone?.includes(searchQuery)
  );

  return (
    <motion.aside
      className="w-80 glass-panel-heavy flex flex-col h-full border border-white/5 relative overflow-hidden shrink-0"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="font-orbitron font-bold text-[10px] tracking-[0.3em] text-textMuted uppercase opacity-60">
            Session Registry
          </h2>
          <p className="text-[9px] font-mono text-white/20 mt-0.5 uppercase tracking-widest">
            {contacts.length} secure node{contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary shadow-neon-primary animate-pulse" />
      </div>

      {/* Search - Animowany Segment (U-Shape Unfolding) */}
      <div className="px-5 pt-5 min-h-[60px] flex items-start">
        <motion.div
          initial={false}
          animate={{
            height: isSearchOpen ? 48 : 44,
            width: isSearchOpen ? '100%' : 44,
          }}
          transition={{
            height: { duration: 0.2 },
            width: { delay: isSearchOpen ? 0.2 : 0, duration: isSearchOpen ? 0.4 : 0.2 }
          }}
          className={`flex items-center overflow-hidden bg-white/[0.03] border border-white/5 rounded-xl cursor-default ${isSearchOpen ? 'shadow-neon-primary/20' : 'hover:border-white/20'}`}
        >
          {/* LUPA (Pancerz błędu) */}
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-11 h-11 flex items-center justify-center shrink-0 hover:text-primary transition-colors"
          >
            <VxRadarIcon size={16} color={isSearchOpen ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'} />
          </button>

          {/* INPUT (Ujawiany po rozsunięciu) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
                className="flex-1 flex items-center pr-4"
              >
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="SEARCH ENCRYPTED NODES..."
                  className="flex-1 bg-transparent text-[10px] font-mono text-white/70 placeholder-white/10 outline-none uppercase tracking-[0.2em]"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-white/20 hover:text-white transition-colors ml-2">
                    <VxBackIcon size={14} />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Contact List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-widest animate-pulse">
              Synchronizing...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-3xl mb-3">📡</span>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Sieć pusta
            </p>
          </div>
        ) : (
          filtered.map((contact, idx) => {
            const isActive = activeContactPhone === contact.contactPhone;
            return (
              <motion.div
                key={contact._id}
                onClick={() => onSelectContact?.(contact)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary/10 border-primary/30 shadow-lg shadow-black/40'
                    : 'border-transparent hover:border-white/10 hover:bg-white/[0.03]'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="flex items-center gap-3 relative z-10">
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center border-2 shrink-0 relative"
                    style={{
                      borderColor: contact.isAI ? '#B026FF' : (contact.isGroup ? '#00f0ff' : '#00f0ff'),
                      backgroundColor: contact.isAI ? '#B026FF10' : (contact.isGroup ? '#00f0ff20' : '#00f0ff10'),
                    }}
                  >
                    {contact.isAI ? <VxNeuralIcon size={24} /> : (contact.isGroup ? <VxSecurityIcon size={24} /> : <VxAvatarIcon size={24} />)}
                    {contact.isAI && (
                      <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-black" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className={`block font-bold text-[13px] tracking-wide truncate transition-colors ${
                      isActive ? 'text-primary' : 'text-white/80 group-hover:text-white'
                    }`}>
                      {contact.displayName || contact.contactPhone}
                      {contact.isGroup && <span className="ml-2 text-[8px] text-cyan-400 px-1 border border-cyan-400/30 rounded">GROUP</span>}
                    </span>
                    <p className="text-[10px] font-mono text-textMuted truncate uppercase tracking-widest mt-0.5">
                      {contact.lastMessage?.content || (contact.isGroup ? `${contact.members.length} CZŁONKÓW` : contact.contactPhone)}
                    </p>
                  </div>

                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </div>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent rounded-xl"
                  />
                )}
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-black/20 border-t border-white/5 space-y-2">
        <button
          onClick={() => setIsAddOpen('MENU')}
          className="w-full py-3 px-4 rounded-xl bg-primary/10 border border-primary/30 text-[10px] font-orbitron text-primary tracking-[0.2em] uppercase hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>+</span> Inicjuj Nowy Kanał
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/10 text-[9px] font-mono text-white/40 tracking-[0.1em] uppercase hover:bg-white/5 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <VxGearIcon size={14} state="idle" /> SYSTEM_SETTINGS
        </button>
      </div>

      {/* Modal Nowy Kanał (Wybor) */}
      <AnimatePresence>
        {isAddOpen === 'MENU' && (
          <SelectionModal 
            onClose={() => setIsAddOpen(false)} 
            onSelectContact={() => setIsAddOpen('CONTACT')}
            onSelectGroup={() => setIsAddOpen('GROUP')}
          />
        )}
        {isAddOpen === 'CONTACT' && (
          <AddContactModal
            myPhone={myPhone}
            onClose={() => setIsAddOpen('MENU')}
            onAdded={() => { loadData(); setIsAddOpen(false); }}
          />
        )}
        {isAddOpen === 'GROUP' && (
          <CreateGroupModal
            myPhone={myPhone}
            onClose={() => setIsAddOpen('MENU')}
            contacts={contacts}
            onAdded={() => { loadData(); setIsAddOpen(false); }}
          />
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

// ─── SELECTION MODAL ────────────────────────────────────────────────────────
function SelectionModal({ onClose, onSelectContact, onSelectGroup }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        className="w-full glass-panel-heavy border border-white/10 rounded-t-2xl p-6 relative gap-4 flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onSelectGroup} className="w-full py-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-orbitron tracking-widest text-xs uppercase hover:bg-purple-500/20 transition flex items-center justify-center gap-2"><VxSecurityIcon size={16} /> Stwórz Grupę</button>
        <button onClick={onSelectContact} className="w-full py-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-orbitron tracking-widest text-xs uppercase hover:bg-cyan-500/20 transition flex items-center justify-center gap-2"><VxProfileIcon size={16} /> Dodaj Kontakt</button>
        <button onClick={onClose} className="w-full py-2 mt-4 text-[10px] text-white/30 uppercase tracking-widest hover:text-white transition">ANULUJ</button>
      </motion.div>
    </motion.div>
  );
}

// ─── CREATE GROUP MODAL ─────────────────────────────────────────────────────
function CreateGroupModal({ myPhone, onClose, onAdded, contacts }) {
  const [groupName, setGroupName] = useState('');
  const [selectedPhones, setSelectedPhones] = useState(new Set());
  const [status, setStatus] = useState(null);
  const { generateGroupKeyAndEnvelopes } = useShield();

  const handleCreate = async () => {
    if (!groupName.trim() || selectedPhones.size === 0) return;
    setStatus('loading');
    
    try {
      const myIdentity = { phone: myPhone, publicKey: localStorage.getItem('vextro_identity_public') };
      const membersList = [myIdentity];
      
      contacts.forEach(c => {
        if (selectedPhones.has(c.contactPhone) && c.publicKey) {
          membersList.push({ phone: c.contactPhone, publicKey: c.publicKey });
        }
      });

      const { envelopes } = generateGroupKeyAndEnvelopes(membersList);

      await axios.post(`${NetworkConfig.BASE_URL}/api/groups/create`, {
        groupName: groupName.trim(),
        adminPhone: myPhone,
        members: envelopes 
      });

      setStatus('success');
      setTimeout(onAdded, 900);
    } catch (e) {
      console.error(e);
      setStatus('error');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end" onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="w-full h-5/6 overflow-auto glass-panel-heavy border border-white/10 rounded-t-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider text-purple-400 flex items-center gap-2"><VxSecurityIcon size={16} /> NOWA GRUPA KRYPTO</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white"><VxBackIcon size={16} /></button>
        </div>
        
        <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="NAZWA GRUPY" className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 mb-4 text-xs font-mono text-white placeholder-white/20 uppercase" />
        
        <p className="text-[10px] font-mono text-white/30 mb-2 uppercase">WYBIERZ WĘZŁY:</p>
        <div className="space-y-2 mb-6">
          {contacts.map(c => {
            const isSelected = selectedPhones.has(c.contactPhone);
            return (
              <div key={c._id} onClick={() => {
                const nw = new Set(selectedPhones);
                if (isSelected) nw.delete(c.contactPhone); else nw.add(c.contactPhone);
                setSelectedPhones(nw);
              }} className={`p-3 border rounded flex items-center gap-3 cursor-pointer transition ${isSelected ? 'bg-purple-500/20 border-purple-500/50' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                <div className={`w-4 h-4 rounded-full border ${isSelected ? 'border-purple-400 bg-purple-400 flex items-center justify-center' : 'border-white/20'}`}>
                  {isSelected && <span className="text-[9px] text-white">✓</span>}
                </div>
                <span className="text-xs font-mono text-white uppercase">{c.displayName || c.contactPhone}</span>
              </div>
            );
          })}
        </div>
        
        <button disabled={status === 'loading' || status === 'success' || !groupName.trim() || selectedPhones.size === 0} onClick={handleCreate} className="w-full py-3 rounded-xl bg-purple-500/20 border border-purple-500/40 text-[10px] font-orbitron text-purple-400 hover:bg-purple-500 hover:text-white uppercase tracking-widest disabled:opacity-50 transition">
          {status === 'loading' ? 'INICJACJA TUNELI...' : status === 'success' ? '✓ GOTO' : 'KONSTRUUJ GRUPĘ'}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── ADD CONTACT MODAL ────────────────────────────────────────────────────────
function AddContactModal({ myPhone, onClose, onAdded }) {
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  const [status, setStatus] = useState(null); // null | loading | error | success
  const [errorMsg, setErrorMsg] = useState('');

  const handleAdd = async () => {
    if (!phone.trim()) { setErrorMsg('Podaj numer telefonu.'); setStatus('error'); return; }
    setStatus('loading');
    setErrorMsg('');
    const result = await ContactsService.addContact(myPhone, phone.trim(), nickname.trim() || phone.trim());
    if (result.success) {
      setStatus('success');
      setTimeout(onAdded, 900);
    } else {
      setStatus('error');
      setErrorMsg(result.error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full glass-panel-heavy border border-white/10 rounded-t-2xl p-6 space-y-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-primary text-lg">◈</span>
            <h3 className="font-orbitron font-bold text-sm text-white uppercase tracking-wider">
              Nowy Węzeł
            </h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-lg"><VxBackIcon size={18} /></button>
        </div>

        <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
          Podaj numer zarejestrowany w sieci VEXTRO
        </p>

        {/* Phone */}
        <div>
          <label className="block text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">
            Numer telefonu
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+48 000 000 000"
            autoFocus
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors"
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
        </div>

        {/* Nickname */}
        <div>
          <label className="block text-[9px] font-mono text-white/30 uppercase tracking-widest mb-2">
            Pseudonim (opcjonalny)
          </label>
          <input
            type="text"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="np. KLAUDIUSZ"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-white/20 focus:outline-none focus:border-primary/50 transition-colors uppercase"
          />
        </div>

        {/* Error */}
        {status === 'error' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <span className="text-red-400 text-xs">⚠</span>
            <p className="text-[11px] font-mono text-red-400">{errorMsg}</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-[11px] font-mono text-green-400 uppercase tracking-widest">✓ Kontakt dodany do sieci</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAdd}
          disabled={status === 'loading' || status === 'success'}
          className="w-full py-3 rounded-xl bg-primary/20 border border-primary/30 text-[11px] font-orbitron text-primary hover:bg-primary hover:text-white transition-all duration-300 uppercase tracking-widest disabled:opacity-50"
        >
          {status === 'loading' ? '⟳ Weryfikowanie...' : 'Nawiąż Połączenie'}
        </button>
      </motion.div>
    </motion.div>
  );
}
