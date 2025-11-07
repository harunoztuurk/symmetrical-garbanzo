// Local Storage yönetimi
import type { Expression, GraphConfig, GraphSettings } from '../types';

const STORAGE_KEY = 'graphCalculatorState';

export interface SavedState {
  expressions: Expression[];
  graphConfig: GraphConfig;
  graphSettings: GraphSettings;
  timestamp: number;
}

/**
 * Uygulama durumunu Local Storage'a kaydet
 */
export function saveState(
  expressions: Expression[],
  graphConfig: GraphConfig,
  graphSettings: GraphSettings
): void {
  try {
    const state: SavedState = {
      expressions,
      graphConfig,
      graphSettings,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('State kaydedilemedi:', error);
  }
}

/**
 * Local Storage'dan uygulama durumunu yükle
 */
export function loadState(): SavedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const state = JSON.parse(stored) as SavedState;
    return state;
  } catch (error) {
    console.error('State yüklenemedi:', error);
    return null;
  }
}

/**
 * Local Storage'ı temizle
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('State temizlenemedi:', error);
  }
}

/**
 * State'i JSON dosyası olarak export et
 */
export function exportState(
  expressions: Expression[],
  graphConfig: GraphConfig,
  graphSettings: GraphSettings
): void {
  try {
    const state: SavedState = {
      expressions,
      graphConfig,
      graphSettings,
      timestamp: Date.now(),
    };
    
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `graph_calculator_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('State export edilemedi:', error);
  }
}

/**
 * JSON dosyasından state import et
 */
export function importState(file: File): Promise<SavedState | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const state = JSON.parse(content) as SavedState;
        resolve(state);
      } catch (error) {
        console.error('State import edilemedi:', error);
        resolve(null);
      }
    };
    reader.onerror = () => {
      console.error('Dosya okunamadı');
      resolve(null);
    };
    reader.readAsText(file);
  });
}

