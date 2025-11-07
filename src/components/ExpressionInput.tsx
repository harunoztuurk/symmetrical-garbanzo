// Tek bir expression input bileşeni
import { useState, useEffect, useRef } from 'react';
import type { Expression, Parameter } from '../types';
import ParameterSlider from './ParameterSlider';
import { debounce } from '../utils/debounce';

interface ExpressionInputProps {
  expression: Expression;
  onUpdate: (value: string) => void;
  onDelete: () => void;
  onUpdateParameter: (paramName: string, updates: Partial<Parameter>) => void;
  onToggleParameterAnimation: (paramName: string) => void;
  onShowTable: () => void;
}

const ExpressionInput: React.FC<ExpressionInputProps> = ({
  expression,
  onUpdate,
  onDelete,
  onUpdateParameter,
  onToggleParameterAnimation,
  onShowTable,
}) => {
  const [value, setValue] = useState(expression.expression);
  const debouncedUpdate = useRef(debounce((val: string) => {
    onUpdate(val);
  }, 300)).current;

  useEffect(() => {
    setValue(expression.expression);
  }, [expression.expression]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    debouncedUpdate(newValue);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-md p-2.5 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-start gap-2">
        <div
          className="w-4 h-4 rounded-full mt-1.5 flex-shrink-0 border border-gray-300 dark:border-gray-600"
          style={{ backgroundColor: expression.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-gray-600 dark:text-gray-400 text-sm">y =</span>
            <input
              type="text"
              value={value}
              onChange={handleChange}
              onKeyDown={(e) => {
                // Delete tuşu ile expression'ı sil
                if (e.key === 'Delete' && !value) {
                  e.preventDefault();
                  onDelete();
                }
              }}
              placeholder="x^2, sin(x), log(x)..."
              className={`flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white px-2.5 py-1.5 rounded text-sm border transition-colors ${
                expression.isValid
                  ? 'border-gray-300 dark:border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                  : 'border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              } focus:outline-none`}
            />
          </div>
          {!expression.isValid && expression.error && (
            <div className="text-red-600 dark:text-red-400 text-xs mt-1 px-1 flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {expression.error}
            </div>
          )}
          {expression.isValid && (
            <button
              onClick={onShowTable}
              className="mt-2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
              title="Tablo Oluştur"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              Tablo
            </button>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
          title="Sil"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
      
      {/* Parametre slider'ları */}
      {expression.isValid && Object.keys(expression.parameters || {}).length > 0 && (
        <div className="mt-2 space-y-2">
          {Object.values(expression.parameters).map((param) => (
            <ParameterSlider
              key={param.name}
              parameter={param}
              onUpdate={(updates) => onUpdateParameter(param.name, updates)}
              onToggleAnimation={() => onToggleParameterAnimation(param.name)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpressionInput;

