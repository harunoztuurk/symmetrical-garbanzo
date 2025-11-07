// Tablo gösterim bileşeni
import type { Point } from '../types';

interface TableComponentProps {
  points: Point[];
  expressionName: string;
  onClose: () => void;
  onExportCSV: () => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  points,
  expressionName,
  onClose,
  onExportCSV,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[90vw] max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Tablo: {expressionName}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onExportCSV}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
            >
              CSV İndir
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-700 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-gray-300 font-semibold">X</th>
                <th className="px-4 py-2 text-gray-300 font-semibold">Y</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {points.map((point, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-700 hover:bg-gray-700"
                >
                  <td className="px-4 py-2 font-mono">
                    {point.x.toFixed(4)}
                  </td>
                  <td className="px-4 py-2 font-mono">
                    {point.y.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 text-gray-400 text-sm">
          Toplam {points.length} nokta
        </div>
      </div>
    </div>
  );
};

export default TableComponent;

