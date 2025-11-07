// Sağ panel - Grafik canvas bileşeni
import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import type { Expression, GraphConfig, Point, GraphSettings } from '../types';
import { evaluateExpression } from '../utils/mathParser';
import {
  definiteIntegral,
  tangentLine,
  checkInequality,
  evaluatePolar,
  checkImplicit,
  findIntersections,
  evaluateParametric,
} from '../utils/advancedMath';

interface GraphCanvasProps {
  expressions: Expression[];
  config: GraphConfig;
  onConfigChange: (config: GraphConfig) => void;
  settings?: GraphSettings;
}

export interface GraphCanvasHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(({
  expressions,
  config,
  onConfigChange,
  settings = { showGrid: true, showAxes: true, theme: 'dark', coordinateSystem: 'cartesian' },
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
  }));
  const [isDragging, setIsDragging] = useState(false);
  const [panStart, setPanStart] = useState<Point | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ x: number; y: number } | null>(null);

  // Canvas'a çizim yap
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height, xMin, xMax, yMin, yMax } = config;
    
    // Geçerli boyut kontrolü
    if (!width || !height || width <= 0 || height <= 0) return;

    // Canvas'ı temizle
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = settings.theme === 'light' ? '#ffffff' : '#111827'; // bg-white veya bg-gray-900
    ctx.fillRect(0, 0, width, height);

    // Koordinat dönüşüm fonksiyonları
    const toScreenX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toScreenY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid çizgileri
    if (settings.showGrid) {
      ctx.strokeStyle = settings.theme === 'light' ? '#f3f4f6' : '#1f2937'; // gray-100 veya gray-800
      ctx.lineWidth = 1;

      // Dikey grid çizgileri
      const xStep = (xMax - xMin) / 20;
      for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        const screenX = toScreenX(x);
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, height);
        ctx.stroke();
      }

      // Yatay grid çizgileri
      const yStep = (yMax - yMin) / 20;
      for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        const screenY = toScreenY(y);
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();
      }
    }

    // Eksenler
    if (settings.showAxes) {
      ctx.strokeStyle = settings.theme === 'light' ? '#374151' : '#e5e7eb'; // gray-700 veya gray-200
      ctx.lineWidth = 1.5;

      // X ekseni
      if (yMin <= 0 && yMax >= 0) {
        const yAxisScreen = toScreenY(0);
        ctx.beginPath();
        ctx.moveTo(0, yAxisScreen);
        ctx.lineTo(width, yAxisScreen);
        ctx.stroke();
      }

      // Y ekseni
      if (xMin <= 0 && xMax >= 0) {
        const xAxisScreen = toScreenX(0);
        ctx.beginPath();
        ctx.moveTo(xAxisScreen, 0);
        ctx.lineTo(xAxisScreen, height);
        ctx.stroke();
      }
    }

    // Eksen etiketleri
    if (settings.showAxes) {
      ctx.fillStyle = settings.theme === 'light' ? '#6b7280' : '#9ca3af'; // gray-500 veya gray-400
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const xStep = (xMax - xMin) / 20;
      const yStep = (yMax - yMin) / 20;

      // X ekseni etiketleri
      for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        if (Math.abs(x) > 0.01) {
          const screenX = toScreenX(x);
          const yAxisScreen = yMin <= 0 && yMax >= 0 ? toScreenY(0) : height - 10;
          ctx.fillText(x.toFixed(1), screenX, yAxisScreen + 5);
        }
      }

      // Y ekseni etiketleri
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        if (Math.abs(y) > 0.01) {
          const screenY = toScreenY(y);
          const xAxisScreen = xMin <= 0 && xMax >= 0 ? toScreenX(0) : 10;
          ctx.fillText(y.toFixed(1), xAxisScreen - 5, screenY);
        }
      }
    }

    // Parametre değerlerini hazırla (tüm expression'lar için ortak)
    const getParamValues = (expr: Expression): Record<string, number> => {
      const paramValues: Record<string, number> = {};
      if (expr.parameters) {
        Object.values(expr.parameters).forEach((param) => {
          paramValues[param.name] = param.value;
        });
      }
      return paramValues;
    };

    // İntegral gölgelendirme (önce çiz, sonra grafikler üzerine gelir)
    expressions.forEach((expr) => {
      if (!expr.isValid || !expr.compiled || !expr.integralRange) return;
      
      const { a, b } = expr.integralRange;
      if (a >= b || a < xMin || b > xMax) return;
      
      const paramValues = getParamValues(expr);
      const step = (b - a) / (width * 2);
      
      ctx.fillStyle = expr.color + '40'; // %25 opacity
      ctx.beginPath();
      ctx.moveTo(toScreenX(a), toScreenY(0));
      
      for (let x = a; x <= b; x += step) {
        const y = evaluateExpression(expr.compiled, x, paramValues);
        if (y !== null && isFinite(y)) {
          ctx.lineTo(toScreenX(x), toScreenY(y));
        }
      }
      
      ctx.lineTo(toScreenX(b), toScreenY(0));
      ctx.closePath();
      ctx.fill();
      
      // İntegral değerini göster
      const integralValue = definiteIntegral(expr.compiled, a, b, paramValues);
      if (integralValue !== null) {
        const midX = (a + b) / 2;
        const midY = evaluateExpression(expr.compiled, midX, paramValues) || 0;
        ctx.fillStyle = expr.color;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `∫ = ${integralValue.toFixed(3)}`,
          toScreenX(midX),
          toScreenY(midY) - 10
        );
      }
    });

    // Eşitsizlik shading
    expressions.forEach((expr) => {
      if (!expr.isValid || !expr.compiled || expr.type !== 'inequality' || !expr.inequalityType) return;
      
      const paramValues = getParamValues(expr);
      const stepX = (xMax - xMin) / (width * 4);
      const stepY = (yMax - yMin) / (height * 4);
      
      ctx.fillStyle = expr.color + '30'; // %20 opacity
      
      for (let x = xMin; x <= xMax; x += stepX) {
        for (let y = yMin; y <= yMax; y += stepY) {
          if (checkInequality(expr.compiled, x, y, paramValues, expr.inequalityType)) {
            ctx.fillRect(toScreenX(x) - 2, toScreenY(y) - 2, 4, 4);
          }
        }
      }
    });

    // Fonksiyon grafiklerini çiz
    expressions.forEach((expr) => {
      if (!expr.isValid || !expr.compiled) return;
      
      // Eşitsizlik ve integral sadece shading yapar, çizgi çizmez
      if (expr.type === 'inequality' || expr.integralRange) return;

      const paramValues = getParamValues(expr);
      ctx.strokeStyle = expr.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      let firstPoint = true;
      
      // Parametrik denklemler
      if (expr.type === 'parametric' && expr.compiled?.x && expr.compiled?.y) {
        const tMin = expr.parametricRange?.tMin ?? 0;
        const tMax = expr.parametricRange?.tMax ?? 2 * Math.PI;
        const step = (tMax - tMin) / (width * 2);
        
        for (let t = tMin; t <= tMax; t += step) {
          const point = evaluateParametric(expr.compiled.x, expr.compiled.y, t, paramValues);
          
          if (point) {
            const screenX = toScreenX(point.x);
            const screenY = toScreenY(point.y);
            
            if (screenX >= -100 && screenX <= width + 100 && screenY >= -100 && screenY <= height + 100) {
              if (firstPoint) {
                ctx.moveTo(screenX, screenY);
                firstPoint = false;
              } else {
                ctx.lineTo(screenX, screenY);
              }
            } else {
              firstPoint = true;
            }
          } else {
            firstPoint = true;
          }
        }
      }
      // Polar koordinatlar
      else if (expr.type === 'polar' || settings.coordinateSystem === 'polar') {
        const thetaMin = expr.polarRange?.thetaMin ?? 0;
        const thetaMax = expr.polarRange?.thetaMax ?? 2 * Math.PI;
        const step = (thetaMax - thetaMin) / (width * 2);
        
        for (let theta = thetaMin; theta <= thetaMax; theta += step) {
          const point = evaluatePolar(expr.compiled, theta, paramValues);
          
          if (point) {
            const screenX = toScreenX(point.x);
            const screenY = toScreenY(point.y);
            
            if (screenX >= -100 && screenX <= width + 100 && screenY >= -100 && screenY <= height + 100) {
              if (firstPoint) {
                ctx.moveTo(screenX, screenY);
                firstPoint = false;
              } else {
                ctx.lineTo(screenX, screenY);
              }
            } else {
              firstPoint = true;
            }
          } else {
            firstPoint = true;
          }
        }
      }
      // İmplicit denklemler (nokta nokta çizim)
      else if (expr.type === 'implicit') {
        const stepX = (xMax - xMin) / (width * 4);
        const stepY = (yMax - yMin) / (height * 4);
        
        for (let x = xMin; x <= xMax; x += stepX) {
          for (let y = yMin; y <= yMax; y += stepY) {
            if (checkImplicit(expr.compiled, x, y, paramValues, 0.05)) {
              const screenX = toScreenX(x);
              const screenY = toScreenY(y);
              ctx.fillRect(screenX - 1, screenY - 1, 2, 2);
            }
          }
        }
      }
      // Normal Kartezyen fonksiyon
      else {
        // Viewport culling: Sadece görünür aralığı çiz
        const visibleXMin = Math.max(xMin, xMin);
        const visibleXMax = Math.min(xMax, xMax);
        const step = (visibleXMax - visibleXMin) / (width * 2);

        for (let x = visibleXMin; x <= visibleXMax; x += step) {
          const y = evaluateExpression(expr.compiled, x, paramValues);
          
          if (y !== null && isFinite(y)) {
            // Y değeri görünür aralıkta mı kontrol et (viewport culling)
            if (y >= yMin && y <= yMax) {
              const screenX = toScreenX(x);
              const screenY = toScreenY(y);

              if (screenY >= -100 && screenY <= height + 100) {
                if (firstPoint) {
                  ctx.moveTo(screenX, screenY);
                  firstPoint = false;
                } else {
                  ctx.lineTo(screenX, screenY);
                }
              } else {
                firstPoint = true;
              }
            } else {
              firstPoint = true;
            }
          } else {
            firstPoint = true;
          }
        }
      }

      ctx.stroke();
      
      // Türev ve teğet çizimi
      if (expr.derivativePoint !== undefined) {
        const tangent = tangentLine(expr.compiled, expr.derivativePoint, paramValues);
        if (tangent) {
          const { slope } = tangent;
          const y0 = evaluateExpression(expr.compiled, expr.derivativePoint, paramValues);
          
          if (y0 !== null) {
            // Teğet doğrusu: y = slope * (x - x0) + y0
            const x0 = expr.derivativePoint;
            const x1 = xMin;
            const x2 = xMax;
            const y1 = slope * (x1 - x0) + y0;
            const y2 = slope * (x2 - x0) + y0;
            
            ctx.strokeStyle = expr.color;
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(toScreenX(x1), toScreenY(y1));
            ctx.lineTo(toScreenX(x2), toScreenY(y2));
            ctx.stroke();
            ctx.setLineDash([]);
            
            // Nokta işareti
            ctx.fillStyle = expr.color;
            ctx.beginPath();
            ctx.arc(toScreenX(x0), toScreenY(y0), 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Türev değeri
            ctx.fillStyle = settings.theme === 'light' ? '#000' : '#fff';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(
              `f'(${x0.toFixed(2)}) = ${slope.toFixed(3)}`,
              toScreenX(x0) + 8,
              toScreenY(y0) - 8
            );
          }
        }
      }
    });
    
    // Kesişim noktalarını çiz (performans için sadece 2 fonksiyon varsa)
    const validFunctions = expressions.filter(
      e => e.isValid && e.compiled && e.type === 'function' && !e.integralRange
    );
    
    // Performans için sadece az sayıda fonksiyon varsa kesişim noktalarını bul
    if (validFunctions.length <= 3) {
      for (let i = 0; i < validFunctions.length; i++) {
        for (let j = i + 1; j < validFunctions.length; j++) {
          try {
            const expr1 = validFunctions[i];
            const expr2 = validFunctions[j];
            const param1 = getParamValues(expr1);
            const param2 = getParamValues(expr2);
            
            const intersections = findIntersections(
              expr1.compiled!,
              expr2.compiled!,
              xMin,
              xMax,
              param1,
              param2
            );
            
            intersections.forEach((point) => {
              ctx.fillStyle = '#ff6b6b';
              ctx.beginPath();
              ctx.arc(toScreenX(point.x), toScreenY(point.y), 5, 0, 2 * Math.PI);
              ctx.fill();
              
              ctx.fillStyle = settings.theme === 'light' ? '#000' : '#fff';
              ctx.font = '10px sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText(
                `(${point.x.toFixed(2)}, ${point.y.toFixed(2)})`,
                toScreenX(point.x),
                toScreenY(point.y) - 10
              );
            });
          } catch (error) {
            // Kesişim noktası bulunurken hata olursa sessizce devam et
            console.warn('Kesişim noktası bulunamadı:', error);
          }
        }
      }
    }
    
    // Mouse hover koordinat gösterimi
    if (hoverPoint && !isDragging) {
      ctx.fillStyle = settings.theme === 'light' ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,39,0.95)';
      ctx.fillRect(10, 10, 140, 40);
      ctx.strokeStyle = settings.theme === 'light' ? '#e5e7eb' : '#374151';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, 10, 140, 40);
      ctx.fillStyle = settings.theme === 'light' ? '#374151' : '#e5e7eb';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`x: ${hoverPoint.x.toFixed(3)}`, 15, 28);
      ctx.fillText(`y: ${hoverPoint.y.toFixed(3)}`, 15, 42);
    }
  }, [expressions, config, settings, hoverPoint, isDragging]);

  // Canvas boyutunu ayarla
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      try {
        const container = canvas.parentElement;
        if (container) {
          const rect = container.getBoundingClientRect();
          const displayWidth = Math.max(rect.width || 800, 100);
          const displayHeight = Math.max(rect.height || 600, 100);
          
          // Canvas'ın gerçek boyutunu ayarla
          if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
            
            onConfigChange({
              ...config,
              width: displayWidth,
              height: displayHeight,
            });
          }
        }
      } catch (error) {
        // Hata durumunda sessizce devam et
      }
    };

    // İlk boyutlandırma için kısa bir gecikme
    const timeoutId = setTimeout(updateSize, 100);
    updateSize();
    
    window.addEventListener('resize', updateSize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateSize);
    };
  }, [config.width, config.height, onConfigChange]);

  // Çizimi güncelle
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse wheel ile zoom
  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const toWorldX = (screenX: number) =>
      (screenX / config.width) * (config.xMax - config.xMin) + config.xMin;
    const toWorldY = (screenY: number) =>
      config.yMax - (screenY / config.height) * (config.yMax - config.yMin);

    const worldX = toWorldX(mouseX);
    const worldY = toWorldY(mouseY);

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    const newXRange = (config.xMax - config.xMin) * zoomFactor;
    const newYRange = (config.yMax - config.yMin) * zoomFactor;

    const newXMin = worldX - (mouseX / config.width) * newXRange;
    const newXMax = newXMin + newXRange;
    const newYMax = worldY + ((config.height - mouseY) / config.height) * newYRange;
    const newYMin = newYMax - newYRange;

    onConfigChange({
      ...config,
      xMin: newXMin,
      xMax: newXMax,
      yMin: newYMin,
      yMax: newYMax,
    });
  }, [config, onConfigChange]);

  // Mouse drag ile pan
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Dünya koordinatlarına çevir
    const toWorldX = (screenX: number) =>
      (screenX / config.width) * (config.xMax - config.xMin) + config.xMin;
    const toWorldY = (screenY: number) =>
      config.yMax - (screenY / config.height) * (config.yMax - config.yMin);
    
    const worldX = toWorldX(mouseX);
    const worldY = toWorldY(mouseY);
    
    setHoverPoint({ x: worldX, y: worldY });
    
    if (!isDragging || !panStart) return;

    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;

    const xRange = config.xMax - config.xMin;
    const yRange = config.yMax - config.yMin;

    const dxWorld = -(dx / config.width) * xRange;
    const dyWorld = (dy / config.height) * yRange;

    onConfigChange({
      ...config,
      xMin: config.xMin + dxWorld,
      xMax: config.xMax + dxWorld,
      yMin: config.yMin + dyWorld,
      yMax: config.yMax + dyWorld,
    });

    setPanStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, panStart, config, onConfigChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setPanStart(null);
  }, []);
  
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    setPanStart(null);
    setHoverPoint(null);
  }, []);

  // Touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isDragging && panStart) {
      const touch = e.touches[0];
      const dx = touch.clientX - panStart.x;
      const dy = touch.clientY - panStart.y;

      const xRange = config.xMax - config.xMin;
      const yRange = config.yMax - config.yMin;

      const dxWorld = -(dx / config.width) * xRange;
      const dyWorld = (dy / config.height) * yRange;

      onConfigChange({
        ...config,
        xMin: config.xMin + dxWorld,
        xMax: config.xMax + dxWorld,
        yMin: config.yMin + dyWorld,
        yMax: config.yMax + dyWorld,
      });

      setPanStart({ x: touch.clientX, y: touch.clientY });
    }
  }, [isDragging, panStart, config, onConfigChange]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setPanStart(null);
  }, []);

  const bgClass = settings.theme === 'light' ? 'bg-white' : 'bg-gray-900';
  
  return (
    <div className={`flex-1 relative ${bgClass} overflow-hidden`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
    </div>
  );
});

GraphCanvas.displayName = 'GraphCanvas';

export default GraphCanvas;

