// Grafik export fonksiyonları

/**
 * Canvas'ı PNG olarak export et
 */
export function exportToPNG(
  canvas: HTMLCanvasElement,
  options: { width?: number; height?: number; scale?: number } = {}
): void {
  const { width = canvas.width, height = canvas.height, scale = 1 } = options;
  
  // Yeni bir canvas oluştur (yüksek çözünürlük için)
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  const ctx = exportCanvas.getContext('2d');
  
  if (!ctx) return;
  
  // Orijinal canvas'ı yeni canvas'a çiz (scale ile)
  ctx.scale(scale, scale);
  ctx.drawImage(canvas, 0, 0);
  
  // PNG olarak indir
  exportCanvas.toBlob((blob) => {
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `graph_${Date.now()}.png`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 'image/png');
}

/**
 * Canvas'ı SVG olarak export et (basit yaklaşım - canvas'ı SVG içine göm)
 */
export function exportToSVG(
  canvas: HTMLCanvasElement,
  options: { width?: number; height?: number } = {}
): void {
  const { width = canvas.width, height = canvas.height } = options;
  
  // Canvas'ı data URL olarak al
  const dataURL = canvas.toDataURL('image/png');
  
  // SVG oluştur
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <image href="${dataURL}" width="${width}" height="${height}"/>
    </svg>
  `.trim();
  
  // SVG'yi indir
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `graph_${Date.now()}.svg`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

