import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { clsx } from 'clsx';

const ELEMENTS = [
  { id: 'stage', icon: 'podium', label: 'Stage', color: '#f47b25' },
  { id: 'booth', icon: 'storefront', label: 'Booth', color: '#3b82f6' },
  { id: 'seating', icon: 'event_seat', label: 'Seating', color: '#22c55e' },
  { id: 'entrance', icon: 'door_front', label: 'Entrance', color: '#8b5cf6' },
  { id: 'restroom', icon: 'wc', label: 'Restroom', color: '#6b7280' },
  { id: 'food', icon: 'restaurant', label: 'Food Area', color: '#ef4444' },
];

const LAYERS = [
  { id: 'floor', name: 'Floor Plan', visible: true },
  { id: 'furniture', name: 'Furniture', visible: true },
  { id: 'zones', name: 'Zones', visible: true },
  { id: 'labels', name: 'Labels', visible: false },
];

const PLACED_ITEMS = [
  { id: 1, type: 'stage', x: 300, y: 100, w: 200, h: 80 },
  { id: 2, type: 'booth', x: 100, y: 250, w: 60, h: 60 },
  { id: 3, type: 'booth', x: 200, y: 250, w: 60, h: 60 },
  { id: 4, type: 'booth', x: 300, y: 250, w: 60, h: 60 },
  { id: 5, type: 'seating', x: 450, y: 250, w: 120, h: 100 },
  { id: 6, type: 'entrance', x: 50, y: 400, w: 40, h: 40 },
];

export default function FloorPlanEditor() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [layers, setLayers] = useState(LAYERS);
  const [zoom, setZoom] = useState(100);
  const [selectedElement, setSelectedElement] = useState(null);

  const toggleLayer = (id) => {
    setLayers(layers.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Venue Floor Plan Editor</h1>
            <p className="text-sm text-gray-500">Grand Convention Center — Main Hall</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <span className="material-icons text-sm mr-1">undo</span>
              Undo
            </Button>
            <Button variant="outline" size="sm">
              <span className="material-icons text-sm mr-1">redo</span>
              Redo
            </Button>
            <Button size="sm">
              <span className="material-icons text-sm mr-1">save</span>
              Save
            </Button>
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-220px)]">
          {/* Left panel - Elements */}
          <div className="w-56 shrink-0 space-y-4 overflow-y-auto scrollbar-thin">
            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                {ELEMENTS.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedTool(el.id)}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                      selectedTool === el.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="material-icons text-xl" style={{ color: el.color }}>{el.icon}</span>
                    <span className="text-[10px] font-medium text-gray-600">{el.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layers</h3>
              <div className="space-y-1">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className="p-0.5"
                      >
                        <span className={`material-icons text-sm ${
                          layer.visible ? 'text-primary' : 'text-gray-300'
                        }`}>
                          {layer.visible ? 'visibility' : 'visibility_off'}
                        </span>
                      </button>
                      <span className="text-xs text-charcoal">{layer.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Canvas */}
          <Card className="flex-1 relative overflow-hidden bg-white p-0">
            {/* Canvas grid */}
            <div
              className="w-full h-full canvas-grid relative"
              style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
            >
              {/* Placed elements */}
              {PLACED_ITEMS.map((item) => {
                const el = ELEMENTS.find((e) => e.id === item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedElement(item.id)}
                    className={clsx(
                      'absolute rounded-lg border-2 flex items-center justify-center cursor-pointer transition-shadow',
                      selectedElement === item.id ? 'shadow-lg ring-2 ring-primary' : 'hover:shadow-md'
                    )}
                    style={{
                      left: item.x,
                      top: item.y,
                      width: item.w,
                      height: item.h,
                      backgroundColor: `${el?.color}15`,
                      borderColor: `${el?.color}40`,
                    }}
                  >
                    <div className="text-center">
                      <span className="material-icons text-lg" style={{ color: el?.color }}>{el?.icon}</span>
                      <p className="text-[8px] font-medium" style={{ color: el?.color }}>{el?.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl flex items-center gap-4 border border-gray-200">
              <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <span className="material-icons text-gray-500 text-lg">remove</span>
              </button>
              <span className="text-xs font-medium text-gray-500 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1 hover:bg-gray-100 rounded transition-colors">
                <span className="material-icons text-gray-500 text-lg">add</span>
              </button>
              <div className="w-px h-4 bg-gray-300" />
              <button className="p-1 hover:bg-gray-100 rounded transition-colors">
                <span className="material-icons text-gray-500 text-lg">fit_screen</span>
              </button>
            </div>
          </Card>

          {/* Right panel - Properties */}
          <div className="w-56 shrink-0">
            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Properties</h3>
              {selectedElement ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Type</label>
                    <p className="text-sm font-medium text-charcoal capitalize">
                      {PLACED_ITEMS.find((i) => i.id === selectedElement)?.type}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">X</label>
                      <p className="text-sm text-charcoal">{PLACED_ITEMS.find((i) => i.id === selectedElement)?.x}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">Y</label>
                      <p className="text-sm text-charcoal">{PLACED_ITEMS.find((i) => i.id === selectedElement)?.y}</p>
                    </div>
                  </div>
                  <Button variant="danger" size="sm" className="w-full mt-4">
                    <span className="material-icons text-sm mr-1">delete</span>
                    Delete
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Select an element to view properties</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
