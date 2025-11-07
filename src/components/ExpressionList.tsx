// Sol panel - Expression listesi bileşeni
import ExpressionInput from './ExpressionInput';
import type { Expression, Parameter } from '../types';

interface ExpressionListProps {
  expressions: Expression[];
  onAddExpression: () => void;
  onUpdateExpression: (id: string, expression: string) => void;
  onDeleteExpression: (id: string) => void;
  onUpdateParameter: (expressionId: string, paramName: string, updates: Partial<Parameter>) => void;
  onToggleParameterAnimation: (expressionId: string, paramName: string) => void;
  onShowTable: (expressionId: string) => void;
  onClose?: () => void;
}

const ExpressionList: React.FC<ExpressionListProps> = ({
  expressions,
  onAddExpression,
  onUpdateExpression,
  onDeleteExpression,
  onUpdateParameter,
  onToggleParameterAnimation,
  onShowTable,
  onClose,
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 lg:p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
            Fonksiyonlar
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={onAddExpression}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          <span>Yeni Fonksiyon Ekle</span>
        </button>
      </div>
      
      {/* Expression List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {expressions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1 font-medium">
              Henüz fonksiyon eklenmedi
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs">
              Yeni fonksiyon eklemek için yukarıdaki butona tıklayın
            </p>
          </div>
        ) : (
          expressions.map((expr) => (
            <ExpressionInput
              key={expr.id}
              expression={expr}
              onUpdate={(value) => onUpdateExpression(expr.id, value)}
              onDelete={() => onDeleteExpression(expr.id)}
              onUpdateParameter={(paramName, updates) =>
                onUpdateParameter(expr.id, paramName, updates)
              }
              onToggleParameterAnimation={(paramName) =>
                onToggleParameterAnimation(expr.id, paramName)
              }
              onShowTable={() => onShowTable(expr.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpressionList;

