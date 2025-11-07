// Ana uygulama bileşeni
import { useState, useCallback, useEffect, useRef } from 'react';
import Toolbar from './components/Toolbar';
import ExpressionList from './components/ExpressionList';
import GraphCanvas, { type GraphCanvasHandle } from './components/GraphCanvas';
import TableModal from './components/TableModal';
import TableComponent from './components/TableComponent';
import SettingsPanel from './components/SettingsPanel';
import ExportModal from './components/ExportModal';
import type { Expression, GraphConfig, GraphSettings, Parameter, Point, TableData, ExportOptions } from './types';
import { parseExpression, COLORS, detectParameters, evaluateExpression } from './utils/mathParser';
import { saveState, loadState, exportState, importState } from './utils/storage';
import { exportToPNG, exportToSVG } from './utils/export';

function App() {
  // Expression state
  const [expressions, setExpressions] = useState<Expression[]>([]);
  
  // Grafik yapılandırması
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    xMin: -10,
    xMax: 10,
    yMin: -10,
    yMax: 10,
    width: 800,
    height: 600,
  });

  // Grafik ayarları - Varsayılan light theme
  const [graphSettings, setGraphSettings] = useState<GraphSettings>({
    showGrid: true,
    showAxes: true,
    theme: 'light',
    coordinateSystem: 'cartesian',
  });

  // Tablo state
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [selectedExpressionId, setSelectedExpressionId] = useState<string | null>(null);

  // Ayarlar state
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Export state
  const [exportOpen, setExportOpen] = useState(false);
  const canvasRef = useRef<GraphCanvasHandle | null>(null);
  
  // İlk yükleme kontrolü
  const isInitialMount = useRef(true);
  
  // Yeni expression ekle
  const handleAddExpression = useCallback(() => {
    const newId = `expr-${Date.now()}-${Math.random()}`;
    const color = COLORS[expressions.length % COLORS.length];
    
    const newExpression: Expression = {
      id: newId,
      expression: '',
      color,
      isValid: false,
      parameters: {},
    };
    
    setExpressions((prev) => [...prev, newExpression]);
  }, [expressions.length]);
  
  // Uygulama yüklendiğinde state'i geri yükle
  useEffect(() => {
    try {
      const saved = loadState();
      if (saved) {
        // Güvenli yükleme - her alanı kontrol et
        if (saved.expressions && Array.isArray(saved.expressions)) {
          setExpressions(saved.expressions);
        }
        if (saved.graphConfig && typeof saved.graphConfig === 'object') {
          setGraphConfig(saved.graphConfig);
        }
        if (saved.graphSettings && typeof saved.graphSettings === 'object') {
          setGraphSettings(saved.graphSettings);
        }
      }
    } catch (error) {
      console.error('State yüklenirken hata:', error);
      // Hata durumunda varsayılan değerlerle devam et
    }
    isInitialMount.current = false;
  }, []); // Sadece mount'ta çalış
  
  // State değiştiğinde otomatik kaydet (ilk mount hariç)
  useEffect(() => {
    if (!isInitialMount.current) {
      saveState(expressions, graphConfig, graphSettings);
    }
  }, [expressions, graphConfig, graphSettings]);
  
  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl veya Cmd tuşu kontrolü
      const isModifier = e.ctrlKey || e.metaKey;
      
      // Yeni expression ekle: Ctrl+N veya Alt+E
      if ((isModifier && e.key === 'n') || (e.altKey && e.key === 'e')) {
        e.preventDefault();
        handleAddExpression();
      }
      
      // Zoom in: Ctrl + +
      if (isModifier && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        const centerX = (graphConfig.xMin + graphConfig.xMax) / 2;
        const centerY = (graphConfig.yMin + graphConfig.yMax) / 2;
        const zoomFactor = 0.9;
        const xRange = (graphConfig.xMax - graphConfig.xMin) * zoomFactor;
        const yRange = (graphConfig.yMax - graphConfig.yMin) * zoomFactor;
        setGraphConfig({
          ...graphConfig,
          xMin: centerX - xRange / 2,
          xMax: centerX + xRange / 2,
          yMin: centerY - yRange / 2,
          yMax: centerY + yRange / 2,
        });
      }
      
      // Zoom out: Ctrl + -
      if (isModifier && e.key === '-') {
        e.preventDefault();
        const centerX = (graphConfig.xMin + graphConfig.xMax) / 2;
        const centerY = (graphConfig.yMin + graphConfig.yMax) / 2;
        const zoomFactor = 1.1;
        const xRange = (graphConfig.xMax - graphConfig.xMin) * zoomFactor;
        const yRange = (graphConfig.yMax - graphConfig.yMin) * zoomFactor;
        setGraphConfig({
          ...graphConfig,
          xMin: centerX - xRange / 2,
          xMax: centerX + xRange / 2,
          yMin: centerY - yRange / 2,
          yMax: centerY + yRange / 2,
        });
      }
      
      // Tüm grafikleri ekrana sığdır: Ctrl+A
      if (isModifier && e.key === 'a') {
        e.preventDefault();
        // Tüm expression'ların min/max değerlerini bul
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        expressions.forEach((expr) => {
          if (expr.isValid && expr.compiled) {
            // Basit bir yaklaşım: görünür aralıkta değerleri kontrol et
            for (let x = graphConfig.xMin; x <= graphConfig.xMax; x += 0.1) {
              const y = evaluateExpression(expr.compiled, x, {});
              if (y !== null && isFinite(y)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
              }
            }
          }
        });
        
        if (isFinite(minX) && isFinite(maxX) && isFinite(minY) && isFinite(maxY)) {
          const padding = 0.1;
          const xRange = maxX - minX;
          const yRange = maxY - minY;
          setGraphConfig({
            ...graphConfig,
            xMin: minX - xRange * padding,
            xMax: maxX + xRange * padding,
            yMin: minY - yRange * padding,
            yMax: maxY + yRange * padding,
          });
        } else {
          // Varsayılan aralık
          setGraphConfig({
            ...graphConfig,
            xMin: -10,
            xMax: 10,
            yMin: -10,
            yMax: 10,
          });
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expressions, graphConfig, handleAddExpression]);

  // Expression güncelle
  const handleUpdateExpression = useCallback((id: string, expression: string) => {
    setExpressions((prev) =>
      prev.map((expr) => {
        if (expr.id === id) {
          const parsed = parseExpression(expression);
          const detectedParams = parsed.isValid ? detectParameters(expression) : [];
          
          // Mevcut parametreleri koru, yeni parametreler ekle
          const existingParams = expr.parameters || {};
          const newParams: Record<string, Parameter> = { ...existingParams };
          
          // Yeni algılanan parametreler için varsayılan değerler
          detectedParams.forEach((paramName) => {
            if (!newParams[paramName]) {
              newParams[paramName] = {
                name: paramName,
                value: 1,
                min: -10,
                max: 10,
                step: 0.1,
                isAnimating: false,
              };
            }
          });
          
          // Artık kullanılmayan parametreleri kaldır
          Object.keys(newParams).forEach((paramName) => {
            if (!detectedParams.includes(paramName)) {
              delete newParams[paramName];
            }
          });
          
          return {
            ...expr,
            expression,
            isValid: parsed.isValid,
            error: parsed.isValid ? undefined : ('error' in parsed ? parsed.error : undefined),
            compiled: parsed.compiled,
            parameters: newParams,
            type: parsed.type || 'function',
            inequalityType: 'inequalityType' in parsed ? parsed.inequalityType : undefined,
          };
        }
        return expr;
      })
    );
  }, []);

  // Expression sil
  const handleDeleteExpression = useCallback((id: string) => {
    setExpressions((prev) => prev.filter((expr) => expr.id !== id));
  }, []);

  // Grafik yapılandırmasını güncelle
  const handleConfigChange = useCallback((config: GraphConfig) => {
    setGraphConfig(config);
  }, []);

  // Parametre güncelle
  const handleUpdateParameter = useCallback((
    expressionId: string,
    paramName: string,
    updates: Partial<Parameter>
  ) => {
    setExpressions((prev) =>
      prev.map((expr) => {
        if (expr.id === expressionId && expr.parameters[paramName]) {
          return {
            ...expr,
            parameters: {
              ...expr.parameters,
              [paramName]: {
                ...expr.parameters[paramName],
                ...updates,
              },
            },
          };
        }
        return expr;
      })
    );
  }, []);

  // Tablo oluştur
  const handleShowTable = useCallback((expressionId: string) => {
    setSelectedExpressionId(expressionId);
    setTableModalOpen(true);
  }, []);

  const handleGenerateTable = useCallback((xStart: number, xEnd: number, step: number) => {
    if (!selectedExpressionId) return;

    const expression = expressions.find((e) => e.id === selectedExpressionId);
    if (!expression || !expression.isValid || !expression.compiled) return;

    const points: Point[] = [];
    
    // Parametre değerlerini hazırla
    const paramValues: Record<string, number> = {};
    if (expression.parameters) {
      Object.values(expression.parameters).forEach((param) => {
        paramValues[param.name] = param.value;
      });
    }

    for (let x = xStart; x <= xEnd; x += step) {
      const y = evaluateExpression(expression.compiled, x, paramValues);
      if (y !== null && isFinite(y)) {
        points.push({ x, y });
      }
    }

    setTableData({
      expressionId: selectedExpressionId,
      xStart,
      xEnd,
      step,
      points,
    });
  }, [selectedExpressionId, expressions]);

  const handleExportCSV = useCallback(() => {
    if (!tableData) return;

    const expression = expressions.find((e) => e.id === tableData.expressionId);
    const expressionName = expression?.expression || 'fonksiyon';
    
    const csvContent = [
      'X,Y',
      ...tableData.points.map((p) => `${p.x},${p.y}`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tablo_${expressionName.replace(/[^a-z0-9]/gi, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tableData, expressions]);

  // Sıfırla
  const handleReset = useCallback(() => {
    setExpressions([]);
    setGraphConfig({
      xMin: -10,
      xMax: 10,
      yMin: -10,
      yMax: 10,
      width: graphConfig.width,
      height: graphConfig.height,
    });
    setTableData(null);
  }, [graphConfig.width, graphConfig.height]);

  // Tema değişikliğini uygula
  const themeClass = graphSettings.theme === 'light' ? 'bg-white' : 'bg-gray-900';

  const handleExport = useCallback((options: ExportOptions) => {
    const canvas = canvasRef.current?.getCanvas();
    if (!canvas) return;
    
    if (options.format === 'png') {
      exportToPNG(canvas, {
        width: options.width,
        height: options.height,
        scale: options.scale || 1,
      });
    } else {
      exportToSVG(canvas, {
        width: options.width,
        height: options.height,
      });
    }
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // İlk render'da canvas boyutunu ayarla
  useEffect(() => {
    const updateInitialSize = () => {
      try {
        const root = document.getElementById('root');
        if (root) {
          const rect = root.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            setGraphConfig(prev => ({
              ...prev,
              width: Math.max(rect.width - 320, 400),
              height: Math.max(rect.height - 56, 400),
            }));
          }
        }
      } catch (error) {
        // Hata durumunda sessizce devam et
      }
    };
    
    // İlk yükleme için kısa bir gecikme
    const timeoutId = setTimeout(updateInitialSize, 100);
    window.addEventListener('resize', updateInitialSize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateInitialSize);
    };
  }, []);

  return (
    <div className={`w-screen h-screen flex flex-col ${themeClass} overflow-hidden`}>
      <Toolbar
        onReset={handleReset}
        onOpenSettings={() => setSettingsOpen(true)}
        onExport={() => setExportOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0 min-w-0">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Expression List - Responsive */}
        <div
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:translate-x-0
            fixed lg:static
            top-0 left-0 h-full
            w-64 sm:w-72 lg:w-64
            max-w-[90vw] lg:max-w-none
            bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
            flex flex-col
            shadow-2xl lg:shadow-none
            z-50 lg:z-auto
            transition-transform duration-300 ease-in-out
          `}
        >
          <ExpressionList
            expressions={expressions}
            onAddExpression={handleAddExpression}
            onUpdateExpression={handleUpdateExpression}
            onDeleteExpression={handleDeleteExpression}
            onUpdateParameter={handleUpdateParameter}
            onToggleParameterAnimation={(expressionId, paramName) => {
              setExpressions((prev) =>
                prev.map((expr) => {
                  if (expr.id === expressionId && expr.parameters[paramName]) {
                    return {
                      ...expr,
                      parameters: {
                        ...expr.parameters,
                        [paramName]: {
                          ...expr.parameters[paramName],
                          isAnimating: !expr.parameters[paramName].isAnimating,
                        },
                      },
                    };
                  }
                  return expr;
                })
              );
            }}
            onShowTable={handleShowTable}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
        
        {/* Graph Canvas - Responsive */}
        <GraphCanvas
          ref={canvasRef}
          expressions={expressions}
          config={graphConfig}
          onConfigChange={handleConfigChange}
          settings={graphSettings}
        />
      </div>
      
      {/* Tablo Modal */}
      {selectedExpressionId && (
        <TableModal
          isOpen={tableModalOpen}
          onClose={() => {
            setTableModalOpen(false);
            setSelectedExpressionId(null);
          }}
          onGenerate={handleGenerateTable}
          expressionName={
            expressions.find((e) => e.id === selectedExpressionId)?.expression || 'Fonksiyon'
          }
        />
      )}
      
      {/* Tablo Gösterimi */}
      {tableData && (
        <TableComponent
          points={tableData.points}
          expressionName={
            expressions.find((e) => e.id === tableData.expressionId)?.expression || 'Fonksiyon'
          }
          onClose={() => setTableData(null)}
          onExportCSV={handleExportCSV}
        />
      )}
      
      {/* Ayarlar Paneli */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={graphSettings}
        config={graphConfig}
        onSettingsChange={setGraphSettings}
        onConfigChange={setGraphConfig}
        onExport={() => exportState(expressions, graphConfig, graphSettings)}
        onImport={async (file) => {
          const state = await importState(file);
          if (state) {
            setExpressions(state.expressions || []);
            setGraphConfig(state.graphConfig || graphConfig);
            setGraphSettings(state.graphSettings || graphSettings);
            setSettingsOpen(false);
          } else {
            alert('Dosya yüklenemedi. Lütfen geçerli bir JSON dosyası seçin.');
          }
        }}
      />
      
      {/* Export Modal */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        onExport={handleExport}
        currentWidth={graphConfig.width}
        currentHeight={graphConfig.height}
      />
    </div>
  );
}

export default App;
