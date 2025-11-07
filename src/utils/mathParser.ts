// Matematiksel ifade parser'ı - mathjs kullanarak
import { create, all } from 'mathjs';
import { getCached, setCached } from './cache';
import type { ExpressionType } from '../types';

// mathjs instance oluştur
const math = create(all);

// 'x' değişkenini ve sabitleri (pi, e) tanımla
const scope = {
  x: 0,
  pi: Math.PI,
  e: Math.E,
};

/**
 * İfade tipini algıla
 */
export function detectExpressionType(expression: string): {
  type: ExpressionType;
  inequalityType?: '>' | '<' | '>=' | '<=';
} {
  const trimmed = expression.trim();
  
  // Eşitsizlik kontrolü: y > f(x), y < f(x), vb.
  const inequalityMatch = trimmed.match(/^y\s*(>=|<=|>|<)\s*(.+)$/i);
  if (inequalityMatch) {
    const op = inequalityMatch[1] as '>' | '<' | '>=' | '<=';
    return { type: 'inequality', inequalityType: op };
  }
  
  // Parametrik kontrolü: x(t), y(t) veya (x(t), y(t)) veya x=t, y=t formatı
  if (trimmed.includes('x(t)') && trimmed.includes('y(t)')) {
    return { type: 'parametric' };
  }
  // x=..., y=... formatı
  const parametricMatch = trimmed.match(/^x\s*=\s*(.+?)\s*,\s*y\s*=\s*(.+)$/i);
  if (parametricMatch) {
    return { type: 'parametric' };
  }
  
  // İmplicit denklem kontrolü: = işareti içeren ve x, y değişkenleri olan
  // Polar ve parametrik kontrolünden sonra kontrol et
  if (trimmed.includes('=') && trimmed.includes('x') && trimmed.includes('y') && 
      !trimmed.match(/^r\s*=/i) && !trimmed.match(/^x\s*=/i)) {
    const implicitMatch = trimmed.match(/^(.+?)\s*=\s*(.+)$/);
    if (implicitMatch) {
      return { type: 'implicit' };
    }
  }
  
  // Polar kontrolü: r = f(theta) veya r(theta)
  if (trimmed.match(/^r\s*=\s*.+$/i) || trimmed.match(/^r\s*\(/i)) {
    return { type: 'polar' };
  }
  
  return { type: 'function' };
}

/**
 * Matematiksel ifadeyi parse eder ve geçerliliğini kontrol eder
 * @param expression - Kullanıcının girdiği matematiksel ifade
 * @returns { isValid: boolean, error?: string, compiled?: any, type?: ExpressionType }
 */
export function parseExpression(expression: string) {
  if (!expression.trim()) {
    return { isValid: false, error: 'İfade boş olamaz' };
  }

  // Cache kontrolü
  const cached = getCached(expression);
  if (cached) {
    return {
      isValid: true,
      compiled: cached.compiled,
      type: cached.type,
      inequalityType: cached.inequalityType,
    };
  }

  try {
    const trimmed = expression.trim();
    const { type, inequalityType } = detectExpressionType(trimmed);
    
    // Eşitsizlik parse
    if (type === 'inequality') {
      const match = trimmed.match(/^y\s*(>=|<=|>|<)\s*(.+)$/i);
      if (match) {
        const funcExpr = match[2].trim();
        const cleaned = funcExpr.replace(/\s+/g, '');
        const compiled = math.compile(cleaned);
        const testResult = compiled.evaluate(scope);
        
        if (typeof testResult !== 'number' || !isFinite(testResult)) {
          return { isValid: false, error: 'Geçersiz eşitsizlik ifadesi' };
        }
        
        const result = { isValid: true, compiled, type, inequalityType };
        setCached(expression, { compiled, type, inequalityType });
        return result;
      }
    }
    
    // Parametrik parse: x=..., y=... formatı
    if (type === 'parametric') {
      const parametricMatch = trimmed.match(/^x\s*=\s*(.+?)\s*,\s*y\s*=\s*(.+)$/i);
      if (parametricMatch) {
        try {
          const xExpr = parametricMatch[1].trim().replace(/\s+/g, '');
          const yExpr = parametricMatch[2].trim().replace(/\s+/g, '');
          
          // t değişkenini kullan
          const paramScope = { t: 0, pi: Math.PI, e: Math.E };
          const xCompiled = math.compile(xExpr);
          const yCompiled = math.compile(yExpr);
          
          const xTest = xCompiled.evaluate(paramScope);
          const yTest = yCompiled.evaluate(paramScope);
          
          if (typeof xTest !== 'number' || typeof yTest !== 'number' || 
              !isFinite(xTest) || !isFinite(yTest)) {
            return { isValid: false, error: 'Geçersiz parametrik ifade' };
          }
          
          const result = { isValid: true, compiled: { x: xCompiled, y: yCompiled }, type };
          setCached(expression, { compiled: { x: xCompiled, y: yCompiled }, type });
          return result;
        } catch (error: any) {
          return { isValid: false, error: 'Parametrik ifade parse edilemedi' };
        }
      }
      return { isValid: false, error: 'Parametrik denklemler için x=..., y=... formatı kullanın' };
    }
    
    // İmplicit denklem parse: f(x,y) = g(x,y)
    if (type === 'implicit') {
      const implicitMatch = trimmed.match(/^(.+?)\s*=\s*(.+)$/);
      if (implicitMatch) {
        try {
          const leftExpr = implicitMatch[1].trim().replace(/\s+/g, '');
          const rightExpr = implicitMatch[2].trim().replace(/\s+/g, '');
          
          // İmplicit için: left - right = 0
          const implicitExpr = `(${leftExpr})-(${rightExpr})`;
          const implicitScope = { x: 0, y: 0, pi: Math.PI, e: Math.E };
          const compiled = math.compile(implicitExpr);
          const testResult = compiled.evaluate(implicitScope);
          
          if (typeof testResult !== 'number' || !isFinite(testResult)) {
            return { isValid: false, error: 'Geçersiz implicit ifade' };
          }
          
          const result = { isValid: true, compiled, type };
          setCached(expression, { compiled, type });
          return result;
        } catch (error: any) {
          return { isValid: false, error: 'Implicit ifade parse edilemedi' };
        }
      }
    }
    
    // Polar parse: r = f(theta) veya r(theta)
    if (type === 'polar') {
      let polarExpr = trimmed.replace(/^r\s*=\s*/i, '').replace(/^r\s*\(/i, '');
      polarExpr = polarExpr.replace(/theta/gi, 't').replace(/θ/gi, 't');
      
      // t değişkenini kullan (theta yerine)
      const cleaned = polarExpr.replace(/\s+/g, '');
      const polarScope = { t: 0, pi: Math.PI, e: Math.E };
      const compiled = math.compile(cleaned);
      const testResult = compiled.evaluate(polarScope);
      
      if (typeof testResult !== 'number' || !isFinite(testResult)) {
        return { isValid: false, error: 'Geçersiz polar ifade' };
      }
      
      const result = { isValid: true, compiled, type };
      setCached(expression, { compiled, type });
      return result;
    }
    
    // Normal fonksiyon parse
    const cleaned = trimmed.replace(/\s+/g, '');
    const compiled = math.compile(cleaned);
    const testResult = compiled.evaluate(scope);
    
    if (typeof testResult !== 'number' || !isFinite(testResult)) {
      return { isValid: false, error: 'Geçersiz ifade: Sonuç sayısal değil' };
    }

    const result = { isValid: true, compiled, type };
    setCached(expression, { compiled, type });
    return result;
  } catch (error: any) {
    let errorMessage = 'Geçersiz ifade';
    
    if (error.message) {
      if (error.message.includes('undefined')) {
        errorMessage = 'Tanımsız değişken veya fonksiyon';
      } else if (error.message.includes('Unexpected')) {
        errorMessage = 'Beklenmeyen karakter veya sözdizimi hatası';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { isValid: false, error: errorMessage };
  }
}

/**
 * İfadedeki parametreleri (x dışındaki tek harfli değişkenler) algılar
 * @param expression - Matematiksel ifade
 * @returns Parametre isimlerinin dizisi
 */
export function detectParameters(expression: string): string[] {
  if (!expression.trim()) return [];
  
  try {
    // İfadeyi temizle
    const cleaned = expression.trim().replace(/\s+/g, '');
    
    // mathjs ile parse et ve değişkenleri al
    const node = math.parse(cleaned);
    const variables: string[] = [];
    
    // Node'u traverse et ve değişkenleri bul
    node.traverse((node: any) => {
      if (node.type === 'SymbolNode' && node.name) {
        const name = node.name;
        // x dışındaki tek harfli değişkenleri parametre olarak kabul et
        // pi ve e gibi sabitleri hariç tut
        if (name !== 'x' && name.length === 1 && /[a-z]/i.test(name) && name !== 'e' && name !== 'i') {
          if (!variables.includes(name)) {
            variables.push(name);
          }
        }
      }
    });
    
    return variables.sort();
  } catch {
    return [];
  }
}

/**
 * Belirli bir x değeri ve parametreler için ifadeyi hesaplar
 * @param compiled - Compile edilmiş ifade
 * @param x - x değeri
 * @param parameters - Parametre değerleri {a: 1, b: 2, ...}
 * @returns Hesaplanan y değeri veya null
 */
export function evaluateExpression(
  compiled: any,
  x: number,
  parameters: Record<string, number> = {}
): number | null {
  try {
    const evalScope = { ...scope, x, ...parameters };
    const result = compiled.evaluate(evalScope);
    if (typeof result === 'number' && isFinite(result)) {
      return result;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Renk paleti - her expression için farklı renk
 */
export const COLORS = [
  '#3b82f6', // mavi
  '#ef4444', // kırmızı
  '#10b981', // yeşil
  '#f59e0b', // turuncu
  '#8b5cf6', // mor
  '#ec4899', // pembe
  '#06b6d4', // cyan
  '#84cc16', // lime
];

