import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { THEMES } from '../../theme/themes';
import { VxAiSwitch, VxGearIcon } from '../ui/icons/kinetic';
import { 
  VxProfileIcon, 
  VxSecurityIcon, 
  VxInterfaceIcon, 
  VxNeuralIcon, 
  VxExitIcon, 
  VxBackIcon 
} from '../ui/icons/static';

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [aiKey, setAiKey] = useState(localStorage.getItem('ai_api_key') || '');
  const [uiScale, setUiScale] = useState(parseFloat(localStorage.getItem('ui_scale')) || 1);
  const [nickname, setNickname] = useState(localStorage.getItem('userNickname') || 'GHOST');
  const [phone] = useState(localStorage.getItem('userPhone') || '—');
  const [isAiEnabled, setIsAiEnabled] = useState(localStorage.getItem('ai_enabled') === 'true');
  const [aiNick, setAiNick] = useState(localStorage.getItem('ai_nick') || '');
  const { themeId, setThemeId, activeTheme } = useTheme();

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', uiScale);
  }, [uiScale]);

  const handleSave = () => {
    localStorage.setItem('ai_api_key', aiKey);
    localStorage.setItem('ai_enabled', isAiEnabled);
    localStorage.setItem('ai_nick', aiNick);
    localStorage.setItem('ui_scale', uiScale);
    localStorage.setItem('userNickname', nickname);
    onClose();
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!isOpen) return null;

  const TABS = [
    { id: 'profile',    label: 'Profile',     icon: <VxProfileIcon size={18} /> },
    { id: 'security',   label: 'Core Security', icon: <VxSecurityIcon size={18} /> },
    { id: 'interface',  label: 'Interface',    icon: <VxInterfaceIcon size={18} /> },
    { id: 'neural',     label: 'VEXTRO AI',    icon: <VxNeuralIcon size={18} /> },
    { id: 'experimental', label: 'Experimental', icon: <VxGearIcon size={18} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full max-w-4xl glass-panel-heavy overflow-hidden flex flex-col border border-white/10 shadow-[0_0_100px_rgba(191,0,255,0.12)]"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
              <div>
                <h2 className="text-xl font-orbitron font-bold text-primary drop-shadow-neon-primary uppercase tracking-[0.2em]">
                  System_Configuration
                </h2>
                <p className="text-[10px] font-mono text-white/30 tracking-widest mt-1">
                  VX-OS / {activeTab.toUpperCase()} / TERMINAL_CTRL
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors text-white/40 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* ── SIDEBAR ────────────────────────────────────────────── */}
              <div className="w-52 border-r border-white/5 p-4 space-y-1 bg-black/20 shrink-0 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-1">
                  {TABS.map(tab => (
                    <TabButton
                      key={tab.id}
                      active={activeTab === tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      label={tab.label}
                      icon={tab.icon}
                    />
                  ))}
                </div>
                {/* Logout button in sidebar bottom */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left border border-transparent text-red-400/60 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 mt-4"
                >
                  <span className="text-red-400/70"><VxExitIcon size={18} /></span>
                  <span className="text-[11px] font-orbitron font-bold uppercase tracking-wider">Terminate</span>
                </button>
              </div>

              {/* ── CONTENT ────────────────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto bg-black/10">
                <AnimatePresence mode="wait">

                  {/* ── PROFILE TAB ─────────────────────────────────── */}
                  {activeTab === 'profile' && (
                    <motion.div key="profile" {...tabAnim} className="p-8 space-y-8">
                      <SectionTitle title="Identity Card" />

                      {/* Profile Card */}
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-6">
                        {/* Avatar Placeholder */}
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="text-primary"><VxProfileIcon size={24} /></span>
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-orbitron font-bold text-white tracking-wide">{nickname}</p>
                          <p className="text-[11px] font-mono text-primary mt-1">{phone}</p>
                          <div className="flex items-center gap-1.5 mt-2 bg-accent/5 border border-accent/10 rounded-full px-2 py-0.5 w-fit">
                            <span className="text-accent text-[9px]">◆</span>
                            <span className="text-[9px] font-mono text-accent uppercase tracking-widest">Identity Verified</span>
                          </div>
                        </div>
                      </div>

                      {/* Nickname edit */}
                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase mb-3 tracking-widest">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          placeholder="GHOST"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                        />
                        <p className="mt-2 text-[9px] text-white/20 uppercase font-mono tracking-tight">
                          Widoczna dla innych uczestników jako identyfikator terminala.
                        </p>
                      </div>

                      <SectionTitle title="Version" />
                      <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest text-center py-2">
                        VEXTRO OS CORE v3.0.0-WEB / BUILD 2026.04
                      </p>
                    </motion.div>
                  )}

                  {/* ── SECURITY TAB ────────────────────────────────── */}
                  {activeTab === 'security' && (
                    <motion.div key="security" {...tabAnim} className="p-8 space-y-8">
                      <SectionTitle title="Core Security" />

                      <SettingRow
                        icon={<VxSecurityIcon size={18} />}
                        iconColor="text-cyan-400"
                        label="Account Security"
                        sub="Biometrics, 2FA, session control"
                        onClick={() => {}}
                      />
                      <SettingRow
                        icon={<VxSecurityIcon size={18} />}
                        iconColor="text-cyan-400"
                        label="Privacy & Encryption"
                        sub="E2EE protocols, disappearing logs"
                        onClick={() => {}}
                      />

                      <SectionTitle title="Encrypted Session Status" />
                      <div className="space-y-3">
                        <InfoBlock label="Protocol" value="Double Ratchet (Signal-Style) v1.4" valueColor="text-cyan-400" />
                        <InfoBlock label="Identity Fingerprint" value="9F:88:21:44:BC:11:0A:01:EE:55:C3:A2:9B:04:12:3F..." valueColor="text-white/60" mono />
                        <InfoBlock label="Key Exchange" value="X25519 / ChaCha20-Poly1305" valueColor="text-cyan-400" />
                      </div>
                    </motion.div>
                  )}

                   {/* ── INTERFACE TAB ───────────────────────────────── */}
                  {activeTab === 'interface' && (
                    <motion.div key="interface" {...tabAnim} className="p-8 space-y-8">
                      <SectionTitle title="Aesthetic Environment" />
                      
                      {/* Theme Picker Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        {Object.values(THEMES).map(theme => {
                          const isActive = themeId === theme.id;
                          return (
                            <button
                              key={theme.id}
                              onClick={() => setThemeId(theme.id)}
                              className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left ${
                                isActive
                                  ? 'shadow-lg scale-[1.02]'
                                  : 'border-white/10 hover:border-white/20 hover:scale-[1.01]'
                              }`}
                              style={{
                                borderColor: isActive ? theme.primary : undefined,
                                boxShadow: isActive ? `0 0 20px ${theme.primary}40` : undefined,
                              }}
                            >
                              {/* Thumbnail — miniatura chat UI */}
                              <div
                                className="w-full h-32 relative overflow-hidden"
                                style={{ backgroundColor: theme.background }}
                              >
                                {/* Aura top */}
                                <div className="absolute top-0 left-0 w-full h-full"
                                  style={{ background: `radial-gradient(ellipse at 20% 0%, ${theme.primary}30, transparent 60%)` }}
                                />
                                {/* Aura bottom */}
                                <div className="absolute bottom-0 right-0 w-full h-full"
                                  style={{ background: `radial-gradient(ellipse at 80% 100%, ${theme.accent}20, transparent 60%)` }}
                                />
                                {/* Mock Header */}
                                <div className="absolute top-0 left-0 right-0 flex items-center gap-1.5 px-3 py-2"
                                  style={{ borderBottom: `1px solid ${theme.primary}30` }}
                                >
                                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.primary }} />
                                  <div className="h-1 rounded w-8 opacity-60" style={{ backgroundColor: theme.primary }} />
                                </div>
                                {/* Mock messages */}
                                <div className="absolute top-8 left-0 right-0 px-3 space-y-1.5">
                                  <div className="flex justify-start">
                                    <div className="h-5 rounded-lg px-2 flex items-center border" style={{ backgroundColor: theme.primary + '18', borderColor: theme.primary + '30' }}>
                                      <div className="h-1.5 w-12 rounded opacity-60" style={{ backgroundColor: theme.accent }} />
                                    </div>
                                  </div>
                                  <div className="flex justify-end">
                                    <div className="h-5 rounded-lg px-2 flex items-center" style={{ backgroundColor: theme.primary }}>
                                      <div className="h-1.5 w-9 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.6)' }} />
                                    </div>
                                  </div>
                                  <div className="flex justify-start">
                                    <div className="h-5 rounded-lg px-2 flex items-center border" style={{ backgroundColor: theme.primary + '18', borderColor: theme.primary + '30' }}>
                                      <div className="h-1.5 w-16 rounded opacity-60" style={{ backgroundColor: theme.accent }} />
                                    </div>
                                  </div>
                                </div>
                                {/* Mock input */}
                                <div className="absolute bottom-2 left-3 right-3 h-5 rounded-full flex items-center justify-end px-2 border"
                                  style={{ backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }}
                                >
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primary }} />
                                </div>
                                {/* Active checkmark */}
                                {isActive && (
                                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                                    style={{ backgroundColor: theme.primary }}
                                  >
                                    ✓
                                  </div>
                                )}
                              </div>

                              {/* Color swatches + label */}
                              <div className="px-3 pt-2.5 pb-3 bg-white/[0.02]">
                                <div className="flex gap-1.5 mb-2">
                                  {[theme.primary, theme.secondary, theme.accent, theme.background].map((c, i) => (
                                    <div key={i} className="w-3.5 h-3.5 rounded-full border border-white/10" style={{ backgroundColor: c }} />
                                  ))}
                                </div>
                                <p className="text-[11px] font-orbitron font-bold text-white uppercase tracking-wide">
                                  {theme.label}
                                </p>
                                <p className="text-[9px] font-mono text-white/30 mt-0.5">{theme.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <SectionTitle title="Synthesis Scaling" />
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Global UI Scale</label>
                          <span className="text-sm font-mono font-bold" style={{ color: activeTheme.primary }}>{Math.round(uiScale * 100)}%</span>
                        </div>
                        <input
                          type="range" min="0.8" max="1.2" step="0.05"
                          value={uiScale}
                          onChange={(e) => setUiScale(parseFloat(e.target.value))}
                          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between mt-2 text-[9px] font-mono text-white/20 uppercase">
                          <span>80% Dense</span>
                          <span>120% Comfort</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* ── NEURAL TAB ──────────────────────────────────── */}
                  {activeTab === 'neural' && (
                    <motion.div key="neural" {...tabAnim} className="p-8 space-y-8">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                        <div>
                          <SectionTitle title="VEXTRO AI Integration" />
                          <p className="text-[11px] text-white/30 font-mono mt-1">Private LLM endpoint configuration</p>
                        </div>
                        <VxAiSwitch isOn={isAiEnabled} onToggle={() => setIsAiEnabled(!isAiEnabled)} />
                      </div>

<AnimatePresence>
{isAiEnabled && (
<motion.div
initial={{ height: 0, opacity: 0 }}
animate={{ height: 'auto', opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
className="overflow-hidden space-y-8"
>

                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase mb-3 tracking-widest">
                          OpenAI API Access Key
                        </label>
                        <div className="relative">
                          <input
                            type="password"
                            value={aiKey}
                            onChange={(e) => setAiKey(e.target.value)}
                            placeholder="sk-...."
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-sm font-mono focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 rounded-full bg-primary shadow-neon-primary animate-pulse" />
                          </div>
                        </div>
                        <p className="mt-2 text-[9px] text-white/20 uppercase font-mono tracking-tight">
                          Klucz przechowywany lokalnie — zasila VEXTRO Neural Engine.
                        </p>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-white/40 uppercase mb-3 tracking-widest">
                          Neural Agent Nickname (Optional)
                        </label>
                        <input
                          type="text"
                          value={aiNick}
                          onChange={(e) => setAiNick(e.target.value)}
                          placeholder="YOUR API CHATBOT AI"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-sm font-mono focus:outline-none focus:border-primary/50 focus:bg-white/[0.05] transition-all"
                        />
                        <p className="mt-2 text-[9px] text-white/20 uppercase font-mono tracking-tight">
                          Spersonalizowana nazwa widoczna na liście kontaktów i w oknie czatu.
                        </p>
                      </div>

                      <InfoBlock label="Neural Model" value="GPT-4o-mini / Private Endpoint" valueColor="text-primary" />
                      <InfoBlock label="Status" value={aiKey ? '● ACTIVE' : '○ NO KEY'} valueColor={aiKey ? 'text-green-400' : 'text-red-400'} />
</motion.div>
)}
</AnimatePresence>
                    </motion.div>
                  )}

                  {/* ── EXPERIMENTAL TAB ────────────────────────────── */}
                  {activeTab === 'experimental' && (
                    <motion.div key="experimental" {...tabAnim} className="p-8 space-y-8">
                      <SectionTitle title="Experimental" />

                      <SettingRow
                        icon={<VxGearIcon size={18} />}
                        iconColor="text-primary"
                        label="System Update"
                        sub="Check for node patches"
                        onClick={() => {}}
                      />

                      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
                        <p className="text-[10px] font-mono text-yellow-400/60 uppercase tracking-widest">
                          ⚠ Funkcje eksperymentalne mogą być niestabilne. Używaj na własne ryzyko.
                        </p>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>

            {/* ── FOOTER ACTIONS ──────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-white/5 bg-black/40 flex justify-end gap-4 shrink-0">
              <button
                onClick={onClose}
                className="px-6 py-2 text-[10px] font-orbitron text-white/40 hover:text-white uppercase tracking-widest transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-primary/20 border border-primary/30 rounded-lg text-[10px] font-orbitron text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-lg hover:shadow-neon-primary uppercase tracking-widest"
              >
                Commit_Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── ANIMATION PRESET ────────────────────────────────────────────────────────
const tabAnim = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.18 },
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <div className="flex items-center gap-4">
      <h3 className="text-[10px] font-orbitron font-bold text-white/50 tracking-[0.25em] uppercase whitespace-nowrap">{title}</h3>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  );
}

function TabButton({ active, onClick, label, icon }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-300 border ${
        active
          ? 'bg-primary/10 border-primary/30 text-primary shadow-lg'
          : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span className={active ? 'text-primary' : 'text-white/30'}>{icon}</span>
      <span className="text-[11px] font-orbitron font-bold uppercase tracking-wider leading-none">{label}</span>
      {active && (
        <motion.div
          layoutId="active-tab-dot"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-neon-primary"
        />
      )}
    </button>
  );
}

function SettingRow({ icon, iconColor, label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group"
    >
      <div className={`w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-white group-hover:text-white">{label}</p>
        <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>
      </div>
      <span className="text-white/20 group-hover:text-white/50 transition-colors"><VxBackIcon size={14} className="rotate-180" /></span>
    </button>
  );
}

function InfoBlock({ label, value, valueColor, mono }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
      <p className="text-[10px] text-white/30 uppercase font-mono mb-1.5">{label}</p>
      <p className={`text-sm ${mono ? 'font-mono text-xs break-all leading-relaxed' : 'font-semibold'} ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
