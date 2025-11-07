// Tablo oluşturma modalı
import { useState } from 'react';
// TableModal - Point import'u kullanılmıyor

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (xStart: number, xEnd: number, step: number) => void;
  expressionName: string;
}

const TableModal: React.FC<TableModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  expressionName,
}) => {
  const [xStart, setXStart] = useState('-10');
  const [xEnd, setXEnd] = useState('10');
  const [step, setStep] = useState('0.5');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const start = parseFloat(xStart);
    const end = parseFloat(xEnd);
    const stepValue = parseFloat(step);

    if (isNaN(start) || isNaN(end) || isNaN(stepValue)) {
      alert('Lütfen geçerli sayılar girin');
      return;
    }

    if (start >= end) {
      alert('Başlangıç değeri bitiş değerinden küçük olmalıdır');
      return;
    }

    if (stepValue <= 0) {
      alert('Adım değeri 0\'dan büyük olmalıdır');
      return;
    }

    onGenerate(start, end, stepValue);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 max-w-[90vw]">
        <h2 className="text-xl font-semibold text-white mb-4">
          Tablo Oluştur: {expressionName}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">X Başlangıç</label>
              <input
                type="number"
                value={xStart}
                onChange={(e) => setXStart(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                step="any"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">X Bitiş</label>
              <input
                type="number"
                value={xEnd}
                onChange={(e) => setXEnd(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                step="any"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm mb-1">Adım</label>
              <input
                type="number"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                step="any"
                min="0.01"
                required
              />
            </div>
          </div>
          <div className="flex gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
            >
              Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TableModal;

