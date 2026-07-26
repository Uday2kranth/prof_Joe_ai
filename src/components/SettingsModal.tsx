import React, { useState, useRef, useEffect } from 'react';
import { X, Key, Save, Check, Eye, EyeOff, Download, Upload } from 'lucide-react';
import type { UserKeys } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userKeys: UserKeys;
  onSaveKeys: (newKeys: UserKeys) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  userKeys,
  onSaveKeys
}) => {
  const [keys, setKeys] = useState<UserKeys>({ ...userKeys });
  const [saved, setSaved] = useState(false);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setKeys({ ...userKeys });
    }
  }, [userKeys, isOpen]);

  if (!isOpen) return null;

  const toggleVisibility = (field: string) => {
    setVisibleFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field: keyof UserKeys, value: string) => {
    setKeys(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveKeys(keys);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(keys, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `chatterbot_api_keys_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported && typeof imported === 'object') {
            const mergedKeys = { ...keys, ...imported };
            setKeys(mergedKeys);
            onSaveKeys(mergedKeys);
            alert('API Credentials JSON successfully imported and saved!');
          }
        } catch (err) {
          alert('Invalid JSON file format.');
        }
      };
    }
  };

  const providerFields = [
    { id: 'ollama', label: 'Ollama Cloud API Key (Rotated Comma-Separated String)', placeholder: '6661bc9b7e6a..., bdb8f1ef6819...' },
    { id: 'gemini', label: 'Google Gemini API Key(s)', placeholder: 'AQ.Ab8RN6...' },
    { id: 'openrouter', label: 'OpenRouter API Key', placeholder: 'sk-or-v1-...' },
    { id: 'nvidia', label: 'NVIDIA NIM Gateway API Key', placeholder: 'nvapi-...' },
    { id: 'groq', label: 'Groq Cloud API Key', placeholder: 'gsk_...' },
    { id: 'mistral', label: 'Mistral AI API Key', placeholder: '8W6aSCXb...' },
    { id: 'cerebras', label: 'Cerebras Cloud API Key', placeholder: 'csk-...' },
    { id: 'sambanova', label: 'SambaNova Cloud API Key', placeholder: 'c72d24de-...' },
    { id: 'nararouter', label: 'NaraRouter API Key', placeholder: 'sk-nry-...' },
    { id: 'huggingface', label: 'Hugging Face Access Token', placeholder: 'hf_...' },
    { id: 'opencode', label: 'OpenCode AI API Key (50 req/day, 20 req/hr free tier)', placeholder: 'oc_...' },
    { id: 'pollinations', label: 'Pollinations Priority Key (Optional)', placeholder: 'sk_...' }
  ] as const;

  return (
    <div className="modal-overlay">
      <div className="modal-content kokonut-drawer-card">
        <div className="modal-header">
          <div className="modal-title">
            <Key className="text-cyan-400" size={20} />
            <h2>API Key Credentials Drawer</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="json-sync-bar">
            <button onClick={handleExportJson} className="btn btn-secondary" title="Export credentials to JSON file">
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" title="Import credentials from JSON file">
              <Upload size={14} />
              <span>Import JSON</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>

          {providerFields.map(field => (
            <div key={field.id} className="key-field">
              <label>{field.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  type={visibleFields[field.id] ? 'text' : 'password'}
                  placeholder={field.placeholder}
                  value={keys[field.id as keyof UserKeys] || ''}
                  onChange={e => handleChange(field.id as keyof UserKeys, e.target.value)}
                  className="key-input"
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => toggleVisibility(field.id)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={visibleFields[field.id] ? 'Hide Key' : 'Show Key'}
                >
                  {visibleFields[field.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn btn-primary">
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span>{saved ? 'Saved!' : 'Save Credentials'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
