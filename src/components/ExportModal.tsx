// Export modal bileşeni
import { useState } from 'react';
import type { ExportOptions } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
  currentWidth: number;
  currentHeight: number;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
  currentWidth,
  currentHeight,
}) => {
  const [format, setFormat] = useState<'png' | 'svg'>('png');
  const [width, setWidth] = useState(currentWidth);
  const [height, setHeight] = useState(currentHeight);
  const [scale, setScale] = useState(2);

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({
      format,
      width,
      height,
      scale: format === 'png' ? scale : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
        <h2 className="text-xl font-semibold text-white mb-4">Grafik Dışa Aktar</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormat('png')}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  format === 'png'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setFormat('svg')}
                className={`flex-1 px-4 py-2 rounded transition-colors ${
                  format === 'svg'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                SVG
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-300 text-sm mb-1">Genişlik</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value) || currentWidth)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                min="100"
                max="5000"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Yükseklik</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value) || currentHeight)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                min="100"
                max="5000"
              />
            </div>
          </div>
          
          {format === 'png' && (
            <div>
              <label className="block text-gray-300 text-sm mb-1">Ölçek (Çözünürlük)</label>
              <input
                type="number"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                min="0.5"
                max="5"
                step="0.5"
              />
              <p className="text-gray-400 text-xs mt-1">
                Gerçek boyut: {Math.round(width * scale)} x {Math.round(height * scale)} px
              </p>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleExport}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            Dışa Aktar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

