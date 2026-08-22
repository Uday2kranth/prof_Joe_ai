import React, { useState, useMemo } from 'react';
import { RefreshCw, Search, CheckSquare, Square, RotateCcw, Cpu, Check, AlertCircle, Save, ChevronDown } from 'lucide-react';
import type { UserKeys, UserCustomModels, CustomModel } from '../types';
import { PROVIDERS } from '../constants';

import { getApiUrl } from '../services/apiService';

interface ModelManagerTabProps {
  userKeys: UserKeys;
  customModels: UserCustomModels;
  onSaveCustomModels: (newCustomModels: UserCustomModels) => void;
  activeProvider?: string;
  activeModel?: string;
  onSelectActiveModel?: (providerId: string, modelId: string) => void;
  isWideMode?: boolean;
}

export const ModelManagerTab: React.FC<ModelManagerTabProps> = ({
  userKeys,
  customModels,
  onSaveCustomModels,
  activeProvider,
  activeModel,
  onSelectActiveModel,
  isWideMode = false
}) => {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(activeProvider || PROVIDERS[0].id);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'enabled' | 'free'>('all');
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState<string | null>(null);

  const selectedProviderGroup = useMemo(() => {
    return PROVIDERS.find(p => p.id === selectedProviderId) || PROVIDERS[0];
  }, [selectedProviderId]);

  const activeApiKey = useMemo(() => {
    if (selectedProviderId === 'pollinations-keyless') return 'keyless_anonymous';
    const keyProp = selectedProviderId.replace('-keyed', '') as keyof UserKeys;
    const rawVal = userKeys ? userKeys[keyProp] : '';
    return typeof rawVal === 'string' ? rawVal : (rawVal ? String(rawVal) : '');
  }, [selectedProviderId, userKeys]);

  const hasApiKey = Boolean(activeApiKey);

  // Initialize or get current provider models list
  const currentModelList: CustomModel[] = useMemo(() => {
    if (customModels[selectedProviderId] && customModels[selectedProviderId].length > 0) {
      return customModels[selectedProviderId];
    }
    // Default fallback from constants
    return selectedProviderGroup.models.map(m => ({
      id: m.value,
      name: m.name,
      enabled: true,
      isFree: m.value.includes('free') || m.name.includes('Free')
    }));
  }, [customModels, selectedProviderId, selectedProviderGroup]);

  // Filtered models list
  const filteredModels = useMemo(() => {
    return currentModelList.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            m.id.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === 'enabled') return m.enabled;
      if (filterMode === 'free') return m.isFree;
      return true;
    });
  }, [currentModelList, searchQuery, filterMode]);

  const handleToggleModel = (modelId: string) => {
    const updatedList = currentModelList.map(m => 
      m.id === modelId ? { ...m, enabled: !m.enabled } : m
    );
    onSaveCustomModels({
      ...customModels,
      [selectedProviderId]: updatedList
    });
  };

  const handleSelectAll = (enable: boolean) => {
    const updatedList = currentModelList.map(m => ({ ...m, enabled: enable }));
    onSaveCustomModels({
      ...customModels,
      [selectedProviderId]: updatedList
    });
  };

  const handleResetDefaults = () => {
    const defaultList: CustomModel[] = selectedProviderGroup.models.map(m => ({
      id: m.value,
      name: m.name,
      enabled: true,
      isFree: m.value.includes('free') || m.name.includes('Free') || m.name.includes('Quota') || m.name.includes('Tier') || m.name.includes('Local')
    }));
    onSaveCustomModels({
      ...customModels,
      [selectedProviderId]: defaultList
    });
    setFetchSuccessMsg(`Reset to ${defaultList.length} verified default models!`);
    setTimeout(() => setFetchSuccessMsg(null), 2500);
  };

  const handleFetchLiveModels = async () => {
    setIsFetching(true);
    setFetchError(null);
    setFetchSuccessMsg(null);

    try {
      const response = await fetch(getApiUrl('/api/models'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProviderId,
          apiKey: activeApiKey,
          customEndpoint: selectedProviderId === 'ollama' ? userKeys.local_endpoint : undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch models from provider endpoint.');
      }

      if (!Array.isArray(data.models) || data.models.length === 0) {
        throw new Error('No active models returned from provider API.');
      }

      // Merge fetched models with current toggle preferences
      const existingMap = new Map(currentModelList.map(m => [m.id, m.enabled]));
      const newCustomModelsList: CustomModel[] = data.models.map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        enabled: existingMap.has(m.id) ? existingMap.get(m.id)! : true,
        isFree: m.isFree,
        contextLength: m.contextLength
      }));

      onSaveCustomModels({
        ...customModels,
        [selectedProviderId]: newCustomModelsList
      });

      setFetchSuccessMsg(`Successfully fetched ${newCustomModelsList.length} live models!`);
      setTimeout(() => setFetchSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Fetch live models failed:', err);
      setFetchError(err.message || 'Error fetching models.');
    } finally {
      setIsFetching(false);
    }
  };

  const freeModelsCount = currentModelList.filter(m => m.isFree).length;
  const enabledCount = currentModelList.filter(m => m.enabled).length;

  return (
    <div className="model-manager-container" style={{ display: 'flex', flexDirection: 'column', gap: isWideMode ? '16px' : '12px' }}>
      {/* WIDE MODE: Quick Horizontal Provider Switcher Carousel */}
      {isWideMode && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'thin'
        }}>
          {PROVIDERS.map(p => {
            const isSelected = p.id === selectedProviderId;
            const provModels = customModels[p.id] || p.models;
            const provKey = userKeys ? (userKeys as any)[p.id.replace('-keyed', '')] : '';
            const isConfigured = p.id === 'pollinations-keyless' || Boolean(provKey);

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProviderId(p.id);
                  setSearchQuery('');
                  setFetchError(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))' 
                    : 'var(--bg-secondary)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConfigured ? '#10b981' : '#94a3b8' }} />
                <span>{p.name}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: isSelected ? 'rgba(6, 182, 212, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#38bdf8' : 'var(--text-muted)'
                }}>
                  {provModels.length}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Provider Selection & Control Bar */}
      <div className="model-manager-header-bar" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: isWideMode ? '14px 18px' : '12px 16px',
        borderRadius: '12px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', position: 'relative' }}>
          <Cpu className="text-cyan-400" size={18} />
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
            Provider:
          </label>
          <div style={{ position: 'relative', flex: 1, minWidth: '170px' }}>
            <button
              type="button"
              onClick={() => setIsProviderDropdownOpen(!isProviderDropdownOpen)}
              className="key-input model-provider-select"
              style={{
                width: '100%',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {selectedProviderGroup.name}
              </span>
              <ChevronDown size={14} style={{ transform: isProviderDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', flexShrink: 0 }} />
            </button>

            {isProviderDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  background: 'rgba(15, 23, 42, 0.98)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  borderRadius: '10px',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.75)',
                  maxHeight: '240px',
                  overflowY: 'auto',
                  padding: '4px'
                }}
              >
                {PROVIDERS.map(p => {
                  const isSelected = p.id === selectedProviderId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProviderId(p.id);
                        setSearchQuery('');
                        setFetchError(null);
                        setIsProviderDropdownOpen(false);
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                        color: isSelected ? '#38bdf8' : '#f8fafc',
                        fontSize: '13px',
                        fontWeight: isSelected ? 700 : 500,
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{p.name}</span>
                      {isSelected && <Check size={14} className="text-cyan-400" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Status Badge & Fetch Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontWeight: 600,
            background: hasApiKey ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
            color: hasApiKey ? '#4ade80' : '#facc15',
            border: `1px solid ${hasApiKey ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`
          }}>
            {selectedProviderId === 'pollinations-keyless' ? '🟢 Keyless Free' : hasApiKey ? '🟢 Key Configured' : '🟡 Key Optional'}
          </span>

          <button
            type="button"
            onClick={handleFetchLiveModels}
            disabled={isFetching}
            className="btn btn-primary"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isFetching ? 0.7 : 1
            }}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            <span>{isFetching ? 'Fetching...' : '⚡ Fetch Models'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSaveCustomModels({
                ...customModels,
                [selectedProviderId]: currentModelList
              });
              const enabledCount = currentModelList.filter(m => m.enabled).length;
              setFetchSuccessMsg(`Saved & applied ${enabledCount} enabled model(s) to Model Picker!`);
              setTimeout(() => setFetchSuccessMsg(null), 3000);
            }}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(59, 130, 246, 0.25))',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: '#38bdf8',
              fontWeight: 600,
              boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)',
              cursor: 'pointer'
            }}
          >
            <Save size={14} />
            <span>💾 Apply to Model Picker</span>
          </button>
        </div>
      </div>

      {/* Messages / Alerts */}
      {fetchError && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertCircle size={16} />
          <span>{fetchError}</span>
        </div>
      )}

      {fetchSuccessMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          color: '#4ade80',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Check size={16} />
          <span>{fetchSuccessMsg}</span>
        </div>
      )}

      {/* Controls & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="🔍 Search models by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="key-input"
            style={{ paddingLeft: '32px', paddingRight: '12px', height: '36px', fontSize: '12px' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              border: filterMode === 'all' ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
              background: filterMode === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: filterMode === 'all' ? '#38bdf8' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            All ({currentModelList.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('free')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              border: filterMode === 'free' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
              background: filterMode === 'free' ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
              color: filterMode === 'free' ? '#4ade80' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Free Tier ({freeModelsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('enabled')}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '8px',
              border: filterMode === 'enabled' ? '1px solid #c084fc' : '1px solid rgba(255,255,255,0.1)',
              background: filterMode === 'enabled' ? 'rgba(192, 132, 252, 0.2)' : 'transparent',
              color: filterMode === 'enabled' ? '#c084fc' : 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            Enabled ({enabledCount})
          </button>
        </div>

        {/* Batch Actions */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => handleSelectAll(true)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '11px', height: '34px' }}
            title="Enable all listed models"
          >
            <CheckSquare size={13} /> Enable All
          </button>
          <button
            type="button"
            onClick={() => handleSelectAll(false)}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '11px', height: '34px' }}
            title="Disable all listed models"
          >
            <Square size={13} /> Disable All
          </button>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="btn btn-secondary"
            style={{ padding: '6px 10px', fontSize: '11px', height: '34px' }}
            title="Reset to provider recommended defaults"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      {/* Model Catalog Grid / List */}
      <div style={isWideMode ? {
        maxHeight: 'calc(100vh - 290px)',
        minHeight: '450px',
        overflowY: 'auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '12px',
        paddingRight: '6px'
      } : {
        maxHeight: '320px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        paddingRight: '4px'
      }}>
        {filteredModels.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '32px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '13px',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px dashed var(--border-color)'
          }}>
            No models matching search or filter criteria.
          </div>
        ) : (
          filteredModels.map(model => {
            const isCurrentlyActive = (activeProvider === selectedProviderId || (selectedProviderGroup && activeProvider === selectedProviderGroup.name)) && activeModel === model.id;

            return (
              <div
                key={model.id}
                onClick={() => handleToggleModel(model.id)}
                className={`model-catalog-item ${model.enabled ? 'enabled' : ''} ${isCurrentlyActive ? 'active-model-item' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: isWideMode ? 'column' : 'row',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: isWideMode ? '12px 14px' : '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  border: isCurrentlyActive ? '1.5px solid #10b981' : model.enabled ? '1px solid rgba(6, 182, 212, 0.35)' : '1px solid var(--border-color)',
                  background: isCurrentlyActive ? 'rgba(16, 185, 129, 0.14)' : model.enabled ? 'var(--bg-secondary)' : 'rgba(15, 23, 42, 0.4)',
                  boxShadow: isCurrentlyActive ? '0 0 14px rgba(16, 185, 129, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                  <input
                    type="checkbox"
                    checked={model.enabled}
                    onChange={() => {}} // handled by parent div onClick
                    style={{ width: '16px', height: '16px', accentColor: '#38bdf8', cursor: 'pointer', marginTop: '2px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: model.enabled ? 'var(--text-main)' : 'var(--text-muted)',
                        wordBreak: 'break-word'
                      }}>
                        {model.name}
                      </span>
                      {isCurrentlyActive && (
                        <span style={{
                          fontSize: '10px',
                          padding: '2px 7px',
                          borderRadius: '6px',
                          background: '#059669',
                          color: '#ffffff',
                          fontWeight: 700,
                          letterSpacing: '0.04em'
                        }}>
                          ACTIVE IN CHAT
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px', wordBreak: 'break-all' }}>
                      {model.id}
                    </span>
                  </div>
                </div>

                {/* Badges & 1-Click Activate Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  marginTop: isWideMode ? '6px' : '0',
                  borderTop: isWideMode ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                  paddingTop: isWideMode ? '6px' : '0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {model.isFree && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                        fontWeight: 700
                      }}>
                        FREE
                      </span>
                    )}
                    {model.contextLength && (
                      <span style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(147, 51, 234, 0.2)',
                        color: '#c084fc',
                        fontWeight: 600
                      }}>
                        {Math.round(model.contextLength / 1024)}k ctx
                      </span>
                    )}
                  </div>

                  {onSelectActiveModel && !isCurrentlyActive && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!model.enabled) {
                          const updatedList = currentModelList.map(m => 
                            m.id === model.id ? { ...m, enabled: true } : m
                          );
                          onSaveCustomModels({
                            ...customModels,
                            [selectedProviderId]: updatedList
                          });
                        }
                        onSelectActiveModel(selectedProviderId, model.id);
                        setFetchSuccessMsg(`Selected ${model.name} for chat.`);
                        setTimeout(() => setFetchSuccessMsg(null), 2500);
                      }}
                      className="btn"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: 'var(--accent-cyan)',
                        border: '1px solid rgba(6, 182, 212, 0.4)',
                        cursor: 'pointer',
                        fontWeight: 700
                      }}
                      title="Select this model for chat"
                    >
                      Select
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
