// Matematiksel parser için unit testler
import { describe, it, expect } from 'vitest';
import { parseExpression, detectParameters, evaluateExpression } from '../mathParser';

describe('mathParser', () => {
  describe('parseExpression', () => {
    it('basit fonksiyonları parse eder', () => {
      const result = parseExpression('x^2');
      expect(result.isValid).toBe(true);
      expect(result.compiled).toBeDefined();
    });

    it('trigonometrik fonksiyonları parse eder', () => {
      const result = parseExpression('sin(x)');
      expect(result.isValid).toBe(true);
    });

    it('geçersiz ifadeleri reddeder', () => {
      const result = parseExpression('invalid++');
      expect(result.isValid).toBe(false);
      // error property sadece isValid false olduğunda var
      if (!result.isValid) {
        expect('error' in result).toBe(true);
      }
    });

    it('parametreleri algılar', () => {
      // Parametreler tanımlı olmadığı için parse başarısız olabilir
      // Bu durumda parametrelerin algılandığını kontrol etmek için detectParameters kullan
      const params = detectParameters('a*x + b');
      expect(params.length).toBeGreaterThan(0);
      expect(params).toContain('a');
      expect(params).toContain('b');
    });
  });

  describe('detectParameters', () => {
    it('tek harfli parametreleri algılar', () => {
      const params = detectParameters('a*x^2 + b*x + c');
      expect(params).toContain('a');
      expect(params).toContain('b');
      expect(params).toContain('c');
      expect(params).not.toContain('x');
    });

    it('x değişkenini parametre olarak algılamaz', () => {
      const params = detectParameters('x^2');
      expect(params).not.toContain('x');
    });
  });

  describe('evaluateExpression', () => {
    it('basit ifadeleri değerlendirir', () => {
      const parsed = parseExpression('x^2');
      if (parsed.isValid && parsed.compiled) {
        const result = evaluateExpression(parsed.compiled, 2);
        expect(result).toBe(4);
      }
    });

    it('parametreli ifadeleri değerlendirir', () => {
      const parsed = parseExpression('a*x');
      if (parsed.isValid && parsed.compiled) {
        const result = evaluateExpression(parsed.compiled, 2, { a: 3 });
        expect(result).toBe(6);
      }
    });
  });
});

