import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import { BUS_ROUTES } from '../data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Map as MapIcon, Users, AlertTriangle, Bus, BarChart3 } from 'lucide-react';
import L from 'leaflet';

// Reusing icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const createBusIcon = (color: string) => L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Mock Analytics Data
const OCCUPANCY_DATA = [
  { name: '08:00', passengers: 35 },
  { name: '10:00', passengers: 20 },
  { name: '12:00', passengers: 45 },
  { name: '14:00', passengers: 30 },
  { name: '16:00', passengers: 40 },
  { name: '18:00', passengers: 15 },
];

const Admin: React.FC = () => {
  const { buses, alerts } = useBus();
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'analytics'>('fleet');
  const [newRoutePoints, setNewRoutePoints] = useState<[number, number][]>([]);
  const [savedRoutes, setSavedRoutes] = useState<{ id: number; points: [number, number][] }[]>([]);
  const routeOccupancyData = BUS_ROUTES.map((route) => {
    const bus = buses.find((b) => b.routeId === route.id);
    const occupancyPct = bus ? Math.round(((bus.capacity - bus.seatsAvailable) / bus.capacity) * 100) : 0;
    const label = route.name.includes('(') ? route.name.split('(')[0].trim() : route.name;
    return { route: label, occupancy: occupancyPct };
  });

  // Map Click Handler for Route Manager
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (activeTab === 'routes') {
          setNewRoutePoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  };

  const handleSaveRoute = () => {
    if (newRoutePoints.length < 2) return;
    setSavedRoutes(prev => [...prev, { id: Date.now(), points: newRoutePoints }]);
    setNewRoutePoints([]);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto bg-slate-50">
      
      {/* Navigation Tabs */}
      <div className="flex gap-4 shrink-0">
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${activeTab === 'fleet' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${activeTab === 'routes' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <MapIcon size={20} />
            <span>Route Manager</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={20} />
            <span>Analytics</span>
          </div>
        </button>
      </div>

      {activeTab === 'fleet' && (
        <div className="flex-1 flex flex-col gap-6">
          {/* Top Row: Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 rounded-full bg-blue-50 text-blue-600">
                <Bus size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{buses.length}</p>
                <p className="text-sm text-slate-500 font-medium">Active Buses</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 rounded-full bg-green-50 text-green-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">85%</p>
                <p className="text-sm text-slate-500 font-medium">Avg Occupancy</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="p-4 rounded-full bg-red-50 text-red-600">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{alerts.length}</p>
                <p className="text-sm text-slate-500 font-medium">Active Alerts</p>
              </div>
            </div>
          </div>

          {/* Main Section: Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px] flex-1">
            {/* Left Column: Fleet Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-800">Fleet Status</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4">Bus ID</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buses.map(bus => {
                      const route = BUS_ROUTES.find(r => r.id === bus.routeId);
                      return (
                        <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-800">{bus.id}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${route?.color}20`, color: route?.color }}>
                              {route?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${bus.status === 'moving' ? 'bg-green-100 text-green-700' : 
                                bus.status === 'breakdown' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'moving' ? 'bg-green-500' : bus.status === 'breakdown' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                              {bus.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {bus.capacity - bus.seatsAvailable} / {bus.capacity}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Fleet Map */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden p-4 relative z-0 h-full min-h-[400px]">
              <MapContainer center={[51.505, -0.09]} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {BUS_ROUTES.map(route => (
                  <Polyline key={route.id} positions={route.path} color={route.color} weight={4} opacity={0.6} />
                ))}

                {buses.map(bus => {
                  const route = BUS_ROUTES.find(r => r.id === bus.routeId);
                  return (
                    <Marker key={bus.id} position={bus.location} icon={createBusIcon(route?.color || '#000')}>
                      <Popup className="custom-popup">
                        <div className="p-2">
                          <h3 className="font-bold text-slate-800">{bus.id}</h3>
                          <p className="text-slate-600 text-sm capitalize">Status: {bus.status}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'routes' && (
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative p-4 h-full">
           <div className="absolute top-8 right-8 z-[1000] bg-white p-4 rounded-xl shadow-lg border border-slate-100">
             <p className="text-sm font-bold text-slate-800 mb-3">Route Builder</p>
             <div className="flex items-center justify-between gap-4 mb-3">
               <span className="text-xs text-slate-500">Points Added</span>
               <span className="text-sm font-mono text-blue-600 font-bold">{newRoutePoints.length}</span>
             </div>
             <button 
               onClick={handleSaveRoute}
               disabled={newRoutePoints.length < 2}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
             >
               Save New Route
             </button>
             <p className="text-[10px] text-slate-400 mt-2 text-center">Click map to add points</p>
           </div>

           <MapContainer center={[51.505, -0.09]} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
             <TileLayer 
               url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
             />
             <MapClickHandler />
             
             {newRoutePoints.length > 0 && (
               <Polyline positions={newRoutePoints} color="#2563EB" dashArray="5, 10" weight={3} />
             )}
             {newRoutePoints.map((pt, i) => (
               <Marker key={i} position={pt} />
             ))}
             
             {savedRoutes.map(route => (
                <Polyline key={route.id} positions={route.points} color="#a855f7" weight={4} opacity={0.7} />
             ))}
           </MapContainer>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Peak Occupancy Trends</h3>
            <div className="h-[360px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={OCCUPANCY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="passengers" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Current Occupancy by Route</h3>
            <div className="h-[360px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={routeOccupancyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="route" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    formatter={(value) => [`${value}%`, 'Occupancy']}
                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="occupancy" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Admin;
