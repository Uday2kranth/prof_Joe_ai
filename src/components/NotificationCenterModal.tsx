import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  Cpu, 
  ShieldAlert, 
  Zap, 
  Info, 
  ArrowRight,
  ExternalLink,
  Search,
  Check
} from 'lucide-react';
import type { ActiveViewType } from '../types';

export interface SystemNotification {
  id: string;
  title: string;
  category: 'models' | 'features' | 'advisories' | 'system';
  badge: string;
  badgeType: 'cyan' | 'amber' | 'emerald' | 'rose' | 'purple';
  date: string;
  description: string;
  details?: string[];
  actionLabel?: string;
  targetWorkspace?: ActiveViewType;
  opensSettings?: boolean;
}

export const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-2026-09-02-presets',
    title: 'Code Dungeon Upgraded to 29 Academic Presets & 2-Column Bento Deck 🏰⚡',
    category: 'features',
    badge: 'NEW FEATURE',
    badgeType: 'cyan',
    date: 'Sept 2026',
    description: 'The Academic Code Lab Preset drawer has been expanded into a responsive 2-column bento deck with domain category filters (AI & Data Science, Web & Cloud, Systems C, Mobile & Embedded IoT) and instant search.',
    details: [
      'Added Multi-Paradigm Database Mastery (SQL, Postgres, Cypher, Mongo, Polyglot Drivers).',
      'Added API Architecture & Protocols (REST, GraphQL, gRPC, OpenAPI 3.1, Polyglot Clients).',
      'Added Go Microservices, Zig Low-Level Systems, C Systems Programming with Makefiles.',
      'Added Mobile App Engineering (Android Studio & Flutter) and Embedded IoT Firmware (ESP32/STM32/Rust/C).'
    ],
    actionLabel: 'Open Code Dungeon',
    targetWorkspace: 'code_lab'
  },
  {
    id: 'notif-2026-09-02-models',
    title: 'AI Model Registry Updates & Legacy Deprecation Timelines 🤖⚡',
    category: 'models',
    badge: 'MODEL UPDATE',
    badgeType: 'purple',
    date: 'Sept 2026',
    description: 'Active model routing verified across all major AI providers. Gemini 2.0/2.5 Flash, Groq Llama 3.3, and DeepSeek R1 reasoning pipelines are now prioritized.',
    details: [
      'Google Gemini: Gemini 2.0 Flash / Pro models are primary. Legacy Gemini 1.0 endpoints are entering deprecation phase across cloud endpoints.',
      'Groq Acceleration: Llama-3.3-70B-Versatile and DeepSeek R1 Distill now active for instant inference speeds.',
      'OpenRouter & Free Tiers: Auto-fallback chains configured with openrouter/free, mistral, and pollinations for zero-downtime reliability.'
    ],
    actionLabel: 'Configure API Keys & Models',
    opensSettings: true
  },
  {
    id: 'notif-2026-08-31-advisory',
    title: 'Senior Architecture & Design Choice Advisory Protocol 🎨📐',
    category: 'advisories',
    badge: 'ADVISORY',
    badgeType: 'amber',
    date: 'Aug 2026',
    description: 'Code Dungeon and Chat Mentor now automatically provide proactive architectural recommendations, design pattern evaluations, and dynamic web search discovery.',
    details: [
      'Web Frontend UI: Proactively advises on component separation, responsive layouts, and accessibility standards.',
      'Backend & Microservices: Advises on layered architecture, DTO validation, and non-blocking I/O.',
      'Dynamic Search: When Web Search is toggled on in the Control Deck, models automatically discover the newest stable package versions.'
    ],
    actionLabel: 'Explore Chat Mentor',
    targetWorkspace: 'chat'
  },
  {
    id: 'notif-2026-08-25-storage',
    title: 'Offline Local Storage & Cloud Sync Protocol 💾☁️',
    category: 'system',
    badge: 'ENHANCEMENT',
    badgeType: 'emerald',
    date: 'Aug 2026',
    description: 'Your chats, syllabus notes, pinned items, and study decks are securely cached in local storage with automatic cloud synchronization when connected.',
    details: [
      'Zero-data loss resilience: Offline edits sync seamlessly when network reconnection occurs.',
      'Native Android APK parity: Fully synchronized with Android asset bundle and Capacitor bridge.'
    ]
  }
];

export const STORAGE_KEY_LAST_READ = 'prof_joe_last_read_notification_id';

export function getHasUnreadNotifications(): boolean {
  try {
    const lastReadId = localStorage.getItem(STORAGE_KEY_LAST_READ);
    if (!lastReadId) return true;
    const latestNotif = SYSTEM_NOTIFICATIONS[0];
    return latestNotif ? latestNotif.id !== lastReadId : false;
  } catch {
    return false;
  }
}

export function markNotificationsAsRead(): void {
  try {
    if (SYSTEM_NOTIFICATIONS.length > 0) {
      localStorage.setItem(STORAGE_KEY_LAST_READ, SYSTEM_NOTIFICATIONS[0].id);
      window.dispatchEvent(new Event('chatterbot_notifications_read'));
    }
  } catch {}
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWorkspace?: (workspace: ActiveViewType) => void;
  onOpenSettings?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onSelectWorkspace,
  onOpenSettings
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'models' | 'features' | 'advisories'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mode-Aware Theme Tracking
  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      const attr = document.documentElement.getAttribute('data-theme');
      if (attr === 'light') return true;
      if (attr === 'dark') return false;
    }
    try {
      const saved = localStorage.getItem('chatterbot_theme') || localStorage.getItem('theme');
      if (saved === 'light') return true;
    } catch {}
    return false;
  });

  useEffect(() => {
    const handleThemeSync = () => {
      let light = false;
      if (typeof document !== 'undefined') {
        const attr = document.documentElement.getAttribute('data-theme');
        if (attr === 'light') light = true;
      }
      try {
        const saved = localStorage.getItem('chatterbot_theme') || localStorage.getItem('theme');
        if (saved === 'light') light = true;
      } catch {}
      setIsLightMode(light);
    };

    window.addEventListener('chatterbot_theme_updated', handleThemeSync);
    window.addEventListener('storage', handleThemeSync);

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          handleThemeSync();
        }
      }
    });

    if (typeof document !== 'undefined' && document.documentElement) {
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    return () => {
      window.removeEventListener('chatterbot_theme_updated', handleThemeSync);
      window.removeEventListener('storage', handleThemeSync);
      observer.disconnect();
    };
  }, []);

  // Mark all as read on open
  useEffect(() => {
    if (isOpen) {
      markNotificationsAsRead();
    }
  }, [isOpen]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SYSTEM_NOTIFICATIONS.filter((notif) => {
      const matchCat = activeCategory === 'all' || notif.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        notif.title.toLowerCase().includes(q) ||
        notif.description.toLowerCase().includes(q) ||
        notif.badge.toLowerCase().includes(q) ||
        (notif.details && notif.details.some(d => d.toLowerCase().includes(q)))
      );
    });
  }, [activeCategory, searchQuery]);

  const getBadgeStyle = (type: SystemNotification['badgeType']) => {
    if (isLightMode) {
      switch (type) {
        case 'cyan':
          return { background: 'rgba(2, 132, 199, 0.12)', color: '#0284c7', border: '1px solid rgba(2, 132, 199, 0.35)' };
        case 'purple':
          return { background: 'rgba(168, 85, 247, 0.12)', color: '#9333ea', border: '1px solid rgba(168, 85, 247, 0.35)' };
        case 'amber':
          return { background: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.35)' };
        case 'emerald':
          return { background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.35)' };
        case 'rose':
          return { background: 'rgba(244, 63, 94, 0.12)', color: '#e11d48', border: '1px solid rgba(244, 63, 94, 0.35)' };
        default:
          return { background: 'rgba(15, 23, 42, 0.08)', color: '#334155', border: '1px solid rgba(15, 23, 42, 0.18)' };
      }
    }
    switch (type) {
      case 'cyan':
        return { background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.4)' };
      case 'purple':
        return { background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' };
      case 'amber':
        return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' };
      case 'emerald':
        return { background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' };
      case 'rose':
        return { background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', border: '1px solid rgba(244, 63, 94, 0.4)' };
      default:
        return { background: 'rgba(255, 255, 255, 0.1)', color: '#e2e8f0', border: '1px solid rgba(255, 255, 255, 0.2)' };
    }
  };

  const getCategoryIcon = (category: SystemNotification['category']) => {
    switch (category) {
      case 'models':
        return <Cpu size={16} color={isLightMode ? '#9333ea' : '#c084fc'} />;
      case 'features':
        return <Sparkles size={16} color={isLightMode ? '#0284c7' : '#38bdf8'} />;
      case 'advisories':
        return <ShieldAlert size={16} color={isLightMode ? '#d97706' : '#fbbf24'} />;
      case 'system':
        return <Zap size={16} color={isLightMode ? '#059669' : '#34d399'} />;
      default:
        return <Info size={16} color={isLightMode ? '#64748b' : '#94a3b8'} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="preset-drawer-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="notification-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '720px',
              maxHeight: '88vh',
              background: isLightMode 
                ? 'rgba(255, 255, 255, 0.98)' 
                : 'linear-gradient(135deg, #0f172a 0%, #020617 100%)',
              border: isLightMode 
                ? '1px solid rgba(2, 132, 199, 0.25)' 
                : '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '24px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: isLightMode 
                ? '0 20px 60px -10px rgba(0, 0, 0, 0.15), 0 0 20px rgba(2, 132, 199, 0.12)' 
                : '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 30px rgba(6, 182, 212, 0.15)',
              backdropFilter: 'blur(20px)',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '18px 24px', 
              borderBottom: isLightMode ? '1px solid rgba(2, 132, 199, 0.15)' : '1px solid rgba(255, 255, 255, 0.08)',
              background: isLightMode ? 'rgba(241, 245, 249, 0.5)' : 'transparent'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '12px', 
                  background: isLightMode 
                    ? 'linear-gradient(135deg, rgba(2, 132, 199, 0.15), rgba(168, 85, 247, 0.15))' 
                    : 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(168, 85, 247, 0.2))', 
                  border: isLightMode 
                    ? '1px solid rgba(2, 132, 199, 0.3)' 
                    : '1px solid rgba(6, 182, 212, 0.4)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: isLightMode ? '#0284c7' : '#38bdf8' 
                }}>
                  <Bell size={20} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    color: isLightMode ? '#0f172a' : '#f8fafc', 
                    margin: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px' 
                  }}>
                    <span>System Updates & Model Notices</span>
                    <span style={{ 
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: isLightMode ? 'rgba(2, 132, 199, 0.15)' : 'rgba(6, 182, 212, 0.2)', 
                      color: isLightMode ? '#0284c7' : '#38bdf8',
                      letterSpacing: '0.04em'
                    }}>LIVE FEED</span>
                  </h2>
                  <p style={{ 
                    fontSize: '0.78rem', 
                    color: isLightMode ? '#64748b' : '#94a3b8', 
                    margin: '3px 0 0 0' 
                  }}>
                    Stay informed on AI model deprecations, new workspace features, and system advisories
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                style={{ 
                  background: isLightMode ? 'rgba(15, 23, 42, 0.06)' : 'rgba(255, 255, 255, 0.06)', 
                  border: 'none', 
                  color: isLightMode ? '#64748b' : '#94a3b8', 
                  cursor: 'pointer', 
                  padding: '6px', 
                  borderRadius: '8px' 
                }}
                aria-label="Close Notifications Modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div style={{ 
              padding: '14px 24px', 
              borderBottom: isLightMode ? '1px solid rgba(2, 132, 199, 0.12)' : '1px solid rgba(255, 255, 255, 0.08)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '12px', 
              background: isLightMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.35)' 
            }}>
              {/* Search Bar */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                background: isLightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.6)', 
                border: isLightMode ? '1px solid rgba(2, 132, 199, 0.25)' : '1px solid rgba(255, 255, 255, 0.12)', 
                borderRadius: '12px', 
                padding: '8px 14px' 
              }}>
                <Search size={16} style={{ color: isLightMode ? '#0284c7' : '#94a3b8', flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search updates (e.g. 'Gemini', 'Presets', 'Groq', 'Llama')..."
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: isLightMode ? '#0f172a' : '#f8fafc',
                    fontSize: '0.82rem',
                    width: '100%'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', color: isLightMode ? '#64748b' : '#94a3b8', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { id: 'all', label: 'All Notices', icon: '📢' },
                    { id: 'models', label: 'Model Changes', icon: '🤖' },
                    { id: 'features', label: 'New Features', icon: '✨' },
                    { id: 'advisories', label: 'Advisories', icon: '🛡️' }
                  ].map((tab) => {
                    const isSelected = activeCategory === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveCategory(tab.id as any)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '10px',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: isSelected
                            ? isLightMode ? '1px solid #0284c7' : '1px solid #06b6d4'
                            : isLightMode ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                          background: isSelected
                            ? isLightMode ? 'linear-gradient(135deg, #0284c7, #06b6d4)' : 'linear-gradient(135deg, rgba(6, 182, 212, 0.22), rgba(168, 85, 247, 0.22))'
                            : isLightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.5)',
                          color: isSelected
                            ? '#ffffff'
                            : isLightMode ? '#475569' : '#94a3b8',
                          boxShadow: isSelected 
                            ? isLightMode ? '0 3px 10px rgba(2, 132, 199, 0.25)' : '0 0 10px rgba(6, 182, 212, 0.2)' 
                            : 'none'
                        }}
                      >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <span style={{ fontSize: '0.72rem', color: isLightMode ? '#059669' : '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <CheckCheck size={14} />
                  <span>Up to date</span>
                </span>
              </div>
            </div>

            {/* Notifications Feed */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {filteredNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: isLightMode ? '#64748b' : '#94a3b8' }}>
                  <p style={{ fontSize: '0.88rem', margin: '0 0 8px 0' }}>No updates found matching "{searchQuery}".</p>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: isLightMode ? '#f1f5f9' : 'rgba(30, 41, 59, 0.6)',
                      border: isLightMode ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: isLightMode ? '#0f172a' : '#f8fafc',
                      cursor: 'pointer'
                    }}
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                filteredNotifications.map((notif) => {
                  const badgeStyle = getBadgeStyle(notif.badgeType);

                  return (
                    <div
                      key={notif.id}
                      style={{
                        background: isLightMode ? '#ffffff' : 'rgba(30, 41, 59, 0.5)',
                        border: isLightMode ? '1px solid rgba(2, 132, 199, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        boxShadow: isLightMode ? '0 4px 14px rgba(2, 132, 199, 0.06)' : 'none'
                      }}
                    >
                      {/* Top Meta Bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              letterSpacing: '0.04em',
                              ...badgeStyle
                            }}
                          >
                            {notif.badge}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: isLightMode ? '#64748b' : '#64748b', fontWeight: 500 }}>
                            {notif.date}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getCategoryIcon(notif.category)}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: isLightMode ? '#0f172a' : '#f8fafc', margin: 0 }}>
                        {notif.title}
                      </h3>

                      {/* Description */}
                      <p style={{ fontSize: '0.80rem', color: isLightMode ? '#334155' : '#94a3b8', margin: 0, lineHeight: 1.55 }}>
                        {notif.description}
                      </p>

                      {/* Detail Bullets */}
                      {notif.details && notif.details.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '6px', 
                          marginTop: '4px', 
                          background: isLightMode ? '#f8fafc' : 'rgba(15, 23, 42, 0.4)', 
                          padding: '10px 12px', 
                          borderRadius: '10px', 
                          border: isLightMode ? '1px solid rgba(2, 132, 199, 0.12)' : '1px solid rgba(255, 255, 255, 0.04)' 
                        }}>
                          {notif.details.map((bullet, idx) => (
                            <div key={idx} style={{ 
                              fontSize: '0.76rem', 
                              color: isLightMode ? '#334155' : '#cbd5e1', 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              gap: '8px', 
                              lineHeight: 1.45 
                            }}>
                              <span style={{ color: isLightMode ? '#0284c7' : '#06b6d4', fontWeight: 800, lineHeight: 1.2 }}>•</span>
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quick Action Button */}
                      {(notif.actionLabel && (notif.targetWorkspace || notif.opensSettings)) && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (notif.opensSettings && onOpenSettings) {
                                onOpenSettings();
                                onClose();
                              } else if (notif.targetWorkspace && onSelectWorkspace) {
                                onSelectWorkspace(notif.targetWorkspace);
                                onClose();
                              }
                            }}
                            style={{
                              fontSize: '0.74rem',
                              padding: '6px 14px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: 'none',
                              background: isLightMode 
                                ? 'linear-gradient(135deg, #0284c7, #06b6d4)' 
                                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                              color: '#ffffff',
                              boxShadow: isLightMode 
                                ? '0 3px 12px rgba(2, 132, 199, 0.25)' 
                                : '0 4px 15px rgba(6, 182, 212, 0.3)'
                            }}
                          >
                            <span>{notif.actionLabel}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
