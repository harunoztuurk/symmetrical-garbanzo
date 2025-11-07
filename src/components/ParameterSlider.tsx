// Parametre slider bileşeni
import { useState, useEffect, useRef } from 'react';
import type { Parameter } from '../types';

interface ParameterSliderProps {
  parameter: Parameter;
  onUpdate: (updates: Partial<Parameter>) => void;
  onToggleAnimation: () => void;
}

const ParameterSlider: React.FC<ParameterSliderProps> = ({
  parameter,
  onUpdate,
  onToggleAnimation,
}) => {
  const [localValue, setLocalValue] = useState(parameter.value.toString());
  const [localMin, setLocalMin] = useState(parameter.min.toString());
  const [localMax, setLocalMax] = useState(parameter.max.toString());
  const [localStep, setLocalStep] = useState(parameter.step.toString());
  const animationRef = useRef<number | null>(null);
  const directionRef = useRef<1 | -1>(1);

  useEffect(() => {
    setLocalValue(parameter.value.toString());
    setLocalMin(parameter.min.toString());
    setLocalMax(parameter.max.toString());
    setLocalStep(parameter.step.toString());
  }, [parameter]);

  // Animasyon kontrolü
  useEffect(() => {
    if (parameter.isAnimating) {
      let lastTime = Date.now();
      const animate = () => {
        const now = Date.now();
        const deltaTime = (now - lastTime) / 1000; // saniye cinsinden
        lastTime = now;
        
        // 60 FPS için yaklaşık 16ms'de bir güncelle
        const speed = 0.5; // birim/saniye
        let newValue = parameter.value + (parameter.step * directionRef.current * speed * deltaTime * 10);
        
        // Sınırları kontrol et ve yön değiştir
        if (newValue >= parameter.max) {
          newValue = parameter.max;
          directionRef.current = -1;
        } else if (newValue <= parameter.min) {
          newValue = parameter.min;
          directionRef.current = 1;
        }
        
        onUpdate({ value: newValue });
        animationRef.current = requestAnimationFrame(animate);
      };
      
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [parameter.isAnimating, parameter.min, parameter.max, parameter.step, parameter.value, onUpdate]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(e.target.value);
    onUpdate({ value: newValue });
  };

  const handleValueInputBlur = () => {
    const numValue = parseFloat(localValue);
    if (!isNaN(numValue)) {
      const clamped = Math.max(parameter.min, Math.min(parameter.max, numValue));
      onUpdate({ value: clamped });
      setLocalValue(clamped.toString());
    } else {
      setLocalValue(parameter.value.toString());
    }
  };

  const handleMinBlur = () => {
    const numValue = parseFloat(localMin);
    if (!isNaN(numValue) && numValue < parameter.max) {
      onUpdate({ min: numValue });
      if (parameter.value < numValue) {
        onUpdate({ value: numValue });
      }
    } else {
      setLocalMin(parameter.min.toString());
    }
  };

  const handleMaxBlur = () => {
    const numValue = parseFloat(localMax);
    if (!isNaN(numValue) && numValue > parameter.min) {
      onUpdate({ max: numValue });
      if (parameter.value > numValue) {
        onUpdate({ value: numValue });
      }
    } else {
      setLocalMax(parameter.max.toString());
    }
  };

  const handleStepBlur = () => {
    const numValue = parseFloat(localStep);
    if (!isNaN(numValue) && numValue > 0) {
      onUpdate({ step: numValue });
    } else {
      setLocalStep(parameter.step.toString());
    }
  };

  return (
    <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-300 font-medium">Parametre: {parameter.name}</span>
        <button
          onClick={onToggleAnimation}
          className={`px-2 py-1 rounded text-xs transition-colors ${
            parameter.isAnimating
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
          }`}
        >
          {parameter.isAnimating ? '⏸ Durdur' : '▶ Oynat'}
        </button>
      </div>
      
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-1">
          <input
            type="range"
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            value={parameter.value}
            onChange={handleSliderChange}
            className="flex-1"
          />
          <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleValueInputBlur}
            className="w-20 bg-gray-600 text-white px-2 py-1 rounded text-xs border border-gray-500"
            step={parameter.step}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <label className="text-gray-400 block mb-1">Min</label>
          <input
            type="number"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={handleMinBlur}
            className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500"
          />
        </div>
        <div>
          <label className="text-gray-400 block mb-1">Max</label>
          <input
            type="number"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={handleMaxBlur}
            className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500"
          />
        </div>
        <div>
          <label className="text-gray-400 block mb-1">Adım</label>
          <input
            type="number"
            value={localStep}
            onChange={(e) => setLocalStep(e.target.value)}
            onBlur={handleStepBlur}
            className="w-full bg-gray-600 text-white px-2 py-1 rounded border border-gray-500"
            step="0.01"
            min="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default ParameterSlider;

