// Gelişmiş matematiksel işlemler: türev, integral, vb.
import type { Point } from '../types';

/**
 * Sayısal türev hesaplama (merkezi fark yöntemi)
 */
export function derivative(
  compiled: any,
  x: number,
  parameters: Record<string, number> = {},
  h: number = 1e-5
): number | null {
  try {
    const evalScope1 = { x: x + h, ...parameters };
    const evalScope2 = { x: x - h, ...parameters };
    
    const f1 = compiled.evaluate(evalScope1);
    const f2 = compiled.evaluate(evalScope2);
    
    if (typeof f1 === 'number' && typeof f2 === 'number' && isFinite(f1) && isFinite(f2)) {
      return (f1 - f2) / (2 * h);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Belirli integral hesaplama (Simpson yöntemi)
 */
export function definiteIntegral(
  compiled: any,
  a: number,
  b: number,
  parameters: Record<string, number> = {},
  n: number = 1000
): number | null {
  try {
    if (a >= b) return null;
    
    const h = (b - a) / n;
    let sum = 0;
    
    // Simpson yöntemi: f(a) + f(b) + 4*sum(f(x_odd)) + 2*sum(f(x_even))
    for (let i = 0; i <= n; i++) {
      const x = a + i * h;
      const evalScope = { x, ...parameters };
      const fx = compiled.evaluate(evalScope);
      
      if (typeof fx !== 'number' || !isFinite(fx)) continue;
      
      if (i === 0 || i === n) {
        sum += fx;
      } else if (i % 2 === 1) {
        sum += 4 * fx;
      } else {
        sum += 2 * fx;
      }
    }
    
    return (h / 3) * sum;
  } catch {
    return null;
  }
}

/**
 * Teğet doğrusu denklemi: y = f'(x0) * (x - x0) + f(x0)
 */
export function tangentLine(
  compiled: any,
  x0: number,
  parameters: Record<string, number> = {}
): { slope: number; intercept: number } | null {
  try {
    const evalScope = { x: x0, ...parameters };
    const y0 = compiled.evaluate(evalScope);
    
    if (typeof y0 !== 'number' || !isFinite(y0)) return null;
    
    const slope = derivative(compiled, x0, parameters);
    if (slope === null) return null;
    
    const intercept = y0 - slope * x0;
    return { slope, intercept };
  } catch {
    return null;
  }
}

/**
 * Eşitsizlik kontrolü: y > f(x), y < f(x), vb.
 */
export function checkInequality(
  compiled: any,
  x: number,
  y: number,
  parameters: Record<string, number> = {},
  type: '>' | '<' | '>=' | '<='
): boolean {
  try {
    const evalScope = { x, ...parameters };
    const fx = compiled.evaluate(evalScope);
    
    if (typeof fx !== 'number' || !isFinite(fx)) return false;
    
    switch (type) {
      case '>':
        return y > fx;
      case '<':
        return y < fx;
      case '>=':
        return y >= fx;
      case '<=':
        return y <= fx;
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * Polar koordinatları Kartezyen'e çevir
 */
export function polarToCartesian(r: number, theta: number): Point {
  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
  };
}

/**
 * Parametrik denklem değerlendirme
 */
export function evaluateParametric(
  xCompiled: any,
  yCompiled: any,
  t: number,
  parameters: Record<string, number> = {}
): Point | null {
  try {
    const evalScope = { t, ...parameters };
    const x = xCompiled.evaluate(evalScope);
    const y = yCompiled.evaluate(evalScope);
    
    if (typeof x === 'number' && typeof y === 'number' && isFinite(x) && isFinite(y)) {
      return { x, y };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Polar fonksiyon değerlendirme: r = f(theta)
 */
export function evaluatePolar(
  compiled: any,
  theta: number,
  parameters: Record<string, number> = {}
): Point | null {
  try {
    const evalScope = { t: theta, ...parameters, pi: Math.PI, e: Math.E };
    const r = compiled.evaluate(evalScope);
    
    if (typeof r !== 'number' || !isFinite(r) || r < 0) {
      return null;
    }
    
    return polarToCartesian(r, theta);
  } catch {
    return null;
  }
}

/**
 * İmplicit denklem için nokta kontrolü: f(x,y) = 0
 */
export function checkImplicit(
  compiled: any,
  x: number,
  y: number,
  parameters: Record<string, number> = {},
  tolerance: number = 0.1
): boolean {
  try {
    const evalScope = { x, y, ...parameters, pi: Math.PI, e: Math.E };
    const result = compiled.evaluate(evalScope);
    
    if (typeof result !== 'number' || !isFinite(result)) {
      return false;
    }
    
    // Sonuç 0'a yakınsa true döndür
    return Math.abs(result) < tolerance;
  } catch {
    return false;
  }
}

/**
 * İki fonksiyonun kesişim noktalarını bul (Newton-Raphson benzeri)
 */
export function findIntersections(
  f1Compiled: any,
  f2Compiled: any,
  xMin: number,
  xMax: number,
  parameters1: Record<string, number> = {},
  parameters2: Record<string, number> = {},
  step: number = 0.1
): Point[] {
  const intersections: Point[] = [];
  
  for (let x = xMin; x <= xMax; x += step) {
    try {
      const scope1 = { x, ...parameters1 };
      const scope2 = { x, ...parameters2 };
      const y1 = f1Compiled.evaluate(scope1);
      const y2 = f2Compiled.evaluate(scope2);
      
      if (typeof y1 === 'number' && typeof y2 === 'number' && 
          isFinite(y1) && isFinite(y2)) {
        const diff = Math.abs(y1 - y2);
        
        // Eğer fark küçükse kesişim noktası olabilir
        if (diff < 0.01) {
          // Daha hassas arama yap
          let bestX = x;
          let bestDiff = diff;
          
          for (let dx = -step; dx <= step; dx += step / 10) {
            const testX = x + dx;
            if (testX < xMin || testX > xMax) continue;
            
            const testScope1 = { x: testX, ...parameters1 };
            const testScope2 = { x: testX, ...parameters2 };
            const testY1 = f1Compiled.evaluate(testScope1);
            const testY2 = f2Compiled.evaluate(testScope2);
            
            if (typeof testY1 === 'number' && typeof testY2 === 'number' &&
                isFinite(testY1) && isFinite(testY2)) {
              const testDiff = Math.abs(testY1 - testY2);
              if (testDiff < bestDiff) {
                bestDiff = testDiff;
                bestX = testX;
              }
            }
          }
          
          if (bestDiff < 0.01) {
            const finalScope1 = { x: bestX, ...parameters1 };
            const finalY = f1Compiled.evaluate(finalScope1);
            if (typeof finalY === 'number' && isFinite(finalY)) {
              // Aynı noktayı tekrar eklememek için kontrol et
              const isDuplicate = intersections.some(
                p => Math.abs(p.x - bestX) < 0.1 && Math.abs(p.y - finalY) < 0.1
              );
              if (!isDuplicate) {
                intersections.push({ x: bestX, y: finalY });
              }
            }
          }
        }
      }
    } catch {
      continue;
    }
  }
  
  return intersections;
}

