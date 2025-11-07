// Grafik hesap makinesi için tip tanımlamaları

export interface Parameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  isAnimating: boolean;
}

export type ExpressionType = 'function' | 'inequality' | 'parametric' | 'polar' | 'implicit';

export interface Expression {
  id: string;
  expression: string;
  color: string;
  isValid: boolean;
  error?: string;
  compiled?: any; // mathjs compiled expression
  parameters: Record<string, Parameter>; // Parametreler: {a: Parameter, b: Parameter, ...}
  type?: ExpressionType; // İfade tipi
  // İntegral için
  integralRange?: { a: number; b: number };
  // Türev için
  derivativePoint?: number;
  // Eşitsizlik için
  inequalityType?: '>' | '<' | '>=' | '<=';
  // Parametrik için
  parametricRange?: { tMin: number; tMax: number };
  // Polar için
  polarRange?: { thetaMin: number; thetaMax: number };
}

export interface GraphConfig {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface GraphSettings {
  showGrid: boolean;
  showAxes: boolean;
  theme: 'light' | 'dark';
  coordinateSystem: 'cartesian' | 'polar';
}

export interface TableData {
  expressionId: string;
  xStart: number;
  xEnd: number;
  step: number;
  points: Point[];
}

export interface ExportOptions {
  format: 'png' | 'svg';
  width: number;
  height: number;
  scale?: number;
}

