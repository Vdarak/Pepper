
import React, { useState } from 'react';

type Config = { 
  apiUrl: string; 
};

interface ConfigurationModalProps {
  config: Config;
  onSave: (config: Config) => void;
  onClose: () => void;
}

const ConfigurationModal: React.FC<ConfigurationModalProps> = ({ config, onSave, onClose }) => {
  const [currentConfig, setCurrentConfig] = useState(config);

  const handleSave = () => {
    onSave(currentConfig);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentConfig(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-550/25 backdrop-blur-lg rounded-xl shadow-2xl w-full max-w-lg p-6 border border-white/10" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-primary mb-4">Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-silver-light mb-1">Processing API URL (Optional)</label>
            <input
              type="text"
              id="apiUrl"
              name="apiUrl"
              value={currentConfig.apiUrl}
              onChange={handleInputChange}
              placeholder="https://your-api-endpoint.com"
              className="w-full bg-slate-800/60 border border-slate-600 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            />
             <p className="text-xs text-silver-medium mt-1">If provided, the parsed job data will be POSTed to your endpoints when you click "Resume Tailoring" or manage profiles.</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-md transition-colors">Save</button>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationModal;
