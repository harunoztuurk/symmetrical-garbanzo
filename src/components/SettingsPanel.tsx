// Ayarlar paneli bileşeni
import type { GraphSettings, GraphConfig } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GraphSettings;
  config: GraphConfig;
  onSettingsChange: (settings: GraphSettings) => void;
  onConfigChange: (config: GraphConfig) => void;
  onExport?: () => void;
  onImport?: (file: File) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  config,
  onSettingsChange,
  onConfigChange,
  onExport,
  onImport,
}) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImport) {
      onImport(file);
    }
    // Input'u sıfırla
    e.target.value = '';
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Ayarlar</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Görünüm Kontrolleri */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Görünüm</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Grid Çizgileri</label>
                <button
                  onClick={() =>
                    onSettingsChange({ ...settings, showGrid: !settings.showGrid })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showGrid ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showGrid ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Eksenler</label>
                <button
                  onClick={() =>
                    onSettingsChange({ ...settings, showAxes: !settings.showAxes })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.showAxes ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.showAxes ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Tema */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Tema</h3>
            <div className="flex gap-2">
              <button
                onClick={() => onSettingsChange({ ...settings, theme: 'light' })}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Açık
              </button>
              <button
                onClick={() => onSettingsChange({ ...settings, theme: 'dark' })}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Koyu
              </button>
            </div>
          </div>

          {/* Eksen Aralıkları */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Eksen Aralıkları</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 text-sm mb-1">X Min</label>
                  <input
                    type="number"
                    value={config.xMin}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        onConfigChange({ ...config, xMin: value });
                      }
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">X Max</label>
                  <input
                    type="number"
                    value={config.xMax}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        onConfigChange({ ...config, xMax: value });
                      }
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Y Min</label>
                  <input
                    type="number"
                    value={config.yMin}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        onConfigChange({ ...config, yMin: value });
                      }
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    step="any"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm mb-1">Y Max</label>
                  <input
                    type="number"
                    value={config.yMax}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        onConfigChange({ ...config, yMax: value });
                      }
                    }}
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    step="any"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Koordinat Sistemi */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Koordinat Sistemi</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  onSettingsChange({ ...settings, coordinateSystem: 'cartesian' })
                }
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  settings.coordinateSystem === 'cartesian'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Kartezyen
              </button>
              <button
                onClick={() =>
                  onSettingsChange({ ...settings, coordinateSystem: 'polar' })
                }
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  settings.coordinateSystem === 'polar'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Polar
              </button>
            </div>
            {settings.coordinateSystem === 'polar' && (
              <p className="text-gray-400 text-sm mt-2">
                Polar koordinat sistemi çizimi Faz 3'te eklenecektir.
              </p>
            )}
          </div>
          
          {/* Proje Yönetimi */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Proje Yönetimi</h3>
            <div className="space-y-2">
              {onExport && (
                <button
                  onClick={onExport}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Projeyi Dışa Aktar
                </button>
              )}
              {onImport && (
                <label className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Projeyi İçe Aktar
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

