import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { venuesAPI } from '../../api';
import toast from 'react-hot-toast';
import { clsx } from 'clsx';

const ELEMENTS = [
  { id: 'stage', icon: 'podium', label: 'Stage', color: '#f47b25' },
  { id: 'booth', icon: 'storefront', label: 'Booth', color: '#3b82f6' },
  { id: 'seating', icon: 'event_seat', label: 'Seating', color: '#22c55e' },
  { id: 'entrance', icon: 'door_front', label: 'Entrance', color: '#8b5cf6' },
  { id: 'restroom', icon: 'wc', label: 'Restroom', color: '#6b7280' },
  { id: 'food', icon: 'restaurant', label: 'Food Area', color: '#ef4444' },
];

const DEFAULT_LAYERS = [
  { id: 'floor', name: 'Floor Plan', visible: true },
  { id: 'furniture', name: 'Furniture', visible: true },
  { id: 'zones', name: 'Zones', visible: true },
  { id: 'labels', name: 'Labels', visible: false },
];

const DEFAULT_ITEMS = [
  { id: '1', type: 'stage', label: 'Main Stage', x: 300, y: 100, w: 200, h: 80 },
  { id: '2', type: 'booth', label: 'Booth A', x: 100, y: 250, w: 60, h: 60 },
  { id: '3', type: 'booth', label: 'Booth B', x: 200, y: 250, w: 60, h: 60 },
  { id: '4', type: 'booth', label: 'Booth C', x: 300, y: 250, w: 60, h: 60 },
  { id: '5', type: 'seating', label: 'Seating Area', x: 450, y: 250, w: 120, h: 100 },
  { id: '6', type: 'entrance', label: 'Main Entrance', x: 50, y: 400, w: 40, h: 40 },
];

export default function FloorPlanEditor() {
  const [selectedTool, setSelectedTool] = useState(null);
  const [layers, setLayers] = useState(DEFAULT_LAYERS);
  const [zoom, setZoom] = useState(100);
  const [selectedElement, setSelectedElement] = useState(null);
  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [history, setHistory] = useState([DEFAULT_ITEMS]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editLabel, setEditLabel] = useState('');

  const pushHistory = (newItems) => {
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(newItems);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    setItems(newItems);
  };

  const undo = () => {
    if (historyIdx > 0) {
      setHistoryIdx(historyIdx - 1);
      setItems(history[historyIdx - 1]);
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1) {
      setHistoryIdx(historyIdx + 1);
      setItems(history[historyIdx + 1]);
    }
  };

  const toggleLayer = (id) => {
    setLayers(layers.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  // Add element to canvas on click
  const handleCanvasClick = (e) => {
    if (!selectedTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (100 / zoom));
    const y = Math.round((e.clientY - rect.top) * (100 / zoom));
    const el = ELEMENTS.find((el) => el.id === selectedTool);
    const newItem = {
      id: `el_${Date.now()}`,
      type: selectedTool,
      label: el?.label || selectedTool,
      x,
      y,
      w: selectedTool === 'stage' ? 200 : 60,
      h: selectedTool === 'stage' ? 80 : 60,
    };
    pushHistory([...items, newItem]);
    toast.success(`${el?.label} placed!`);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;
    pushHistory(items.filter((i) => i.id !== selectedElement));
    setSelectedElement(null);
    toast.success('Element deleted');
  };

  const handleUpdateLabel = () => {
    if (!selectedElement || !editLabel.trim()) return;
    pushHistory(items.map((i) => (i.id === selectedElement ? { ...i, label: editLabel } : i)));
    toast.success('Label updated');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save as a floor plan
      await venuesAPI.createFloorPlan({
        event_id: 'default',
        venue_id: 'default',
        name: 'Main Hall Floor Plan',
        canvas_width: 800,
        canvas_height: 600,
        elements: items.map((i) => ({
          id: i.id,
          type: i.type,
          label: i.label,
          x: i.x,
          y: i.y,
          width: i.w,
          height: i.h,
          status: 'available',
          style: {},
        })),
        layers: layers,
      });
      toast.success('Floor plan saved!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save floor plan');
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedElement);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-charcoal">Venue Floor Plan Editor</h1>
            <p className="text-sm text-gray-500">Grand Convention Center — Main Hall</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={historyIdx === 0}>
              <span className="material-icons text-sm mr-1">undo</span> Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={historyIdx === history.length - 1}>
              <span className="material-icons text-sm mr-1">redo</span> Redo
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              <span className="material-icons text-sm mr-1">save</span> Save
            </Button>
          </div>
        </div>

        <div className="flex gap-4 h-[calc(100vh-220px)]">
          {/* Left panel */}
          <div className="w-56 shrink-0 space-y-4 overflow-y-auto scrollbar-thin">
            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Elements</h3>
              <p className="text-xs text-gray-400 mb-2">Click an element then click on the canvas to place it</p>
              <div className="grid grid-cols-2 gap-2">
                {ELEMENTS.map((el) => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedTool(selectedTool === el.id ? null : el.id)}
                    className={clsx(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border transition-all',
                      selectedTool === el.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <span className="material-icons text-xl" style={{ color: el.color }}>{el.icon}</span>
                    <span className="text-[10px] font-medium text-gray-600">{el.label}</span>
                  </button>
                ))}
              </div>
              {selectedTool && (
                <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setSelectedTool(null)}>
                  Cancel Placement
                </Button>
              )}
            </Card>

            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Layers</h3>
              <div className="space-y-1">
                {layers.map((layer) => (
                  <div key={layer.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleLayer(layer.id)} className="p-0.5">
                        <span className={`material-icons text-sm ${layer.visible ? 'text-primary' : 'text-gray-300'}`}>
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
            <div
              className="w-full h-full relative"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top left',
                cursor: selectedTool ? 'crosshair' : 'default',
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
              onClick={handleCanvasClick}
            >
              {items.map((item) => {
                const el = ELEMENTS.find((e) => e.id === item.type);
                return (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(item.id);
                      setEditLabel(item.label);
                    }}
                    className={clsx(
                      'absolute rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-shadow',
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
                    <span className="material-icons text-lg" style={{ color: el?.color }}>{el?.icon}</span>
                    <p className="text-[8px] font-medium leading-tight text-center mt-0.5" style={{ color: el?.color }}>
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom toolbar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl flex items-center gap-4 border border-gray-200">
              <button onClick={() => setZoom(Math.max(25, zoom - 25))} className="p-1 hover:bg-gray-100 rounded">
                <span className="material-icons text-gray-500 text-lg">remove</span>
              </button>
              <span className="text-xs font-medium text-gray-500 w-12 text-center">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="p-1 hover:bg-gray-100 rounded">
                <span className="material-icons text-gray-500 text-lg">add</span>
              </button>
              <div className="w-px h-4 bg-gray-300" />
              <button onClick={() => setZoom(100)} className="p-1 hover:bg-gray-100 rounded">
                <span className="material-icons text-gray-500 text-lg">fit_screen</span>
              </button>
            </div>
          </Card>

          {/* Right panel - Properties */}
          <div className="w-56 shrink-0">
            <Card className="p-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Properties</h3>
              {selectedItem ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Type</label>
                    <p className="text-sm font-medium text-charcoal capitalize">{selectedItem.type}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 uppercase">Label</label>
                    <div className="flex gap-1 mt-1">
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary"
                      />
                      <button onClick={handleUpdateLabel} className="p-1 rounded-lg hover:bg-gray-100 text-primary">
                        <span className="material-icons text-sm">check</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">X</label>
                      <p className="text-sm text-charcoal">{selectedItem.x}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">Y</label>
                      <p className="text-sm text-charcoal">{selectedItem.y}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">Width</label>
                      <p className="text-sm text-charcoal">{selectedItem.w}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-gray-500 uppercase">Height</label>
                      <p className="text-sm text-charcoal">{selectedItem.h}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setSelectedElement(null)}>
                    Deselect
                  </Button>
                  <Button variant="danger" size="sm" className="w-full" onClick={handleDeleteElement}>
                    <span className="material-icons text-sm mr-1">delete</span> Delete
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-8">Select an element to view properties</p>
              )}
            </Card>

            {/* Stats */}
            <Card className="p-3 mt-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Stats</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Elements</span>
                  <span className="font-medium text-charcoal">{items.length}</span>
                </div>
                {ELEMENTS.map((el) => {
                  const count = items.filter((i) => i.type === el.id).length;
                  if (count === 0) return null;
                  return (
                    <div key={el.id} className="flex justify-between">
                      <span className="text-gray-500">{el.label}</span>
                      <span className="font-medium" style={{ color: el.color }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
