import React, { useState } from 'react';
import { useBus } from '../context/BusContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LayoutDashboard, Map as MapIcon, Users, AlertTriangle, Bus, BarChart3, X } from 'lucide-react';
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
  const { buses, alerts, routes, addRoute } = useBus();
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'analytics'>('fleet');
  const [newRoutePoints, setNewRoutePoints] = useState<[number, number][]>([]);
  const [routeDetailsOpen, setRouteDetailsOpen] = useState(false);
  const [routeName, setRouteName] = useState('');
  const [routeColor, setRouteColor] = useState('#ef4444');
  const routeOccupancyData = routes.map((route) => {
    const bus = buses.find((b) => b.routeId === route.id);
    const occupancyPct = bus ? Math.round(((bus.capacity - bus.seatsAvailable) / bus.capacity) * 100) : 0;
    const label = route.name.includes('(') ? route.name.split('(')[0].trim() : route.name;
    return { route: label, occupancy: occupancyPct };
  });
  const totalCapacity = buses.reduce((sum, b) => sum + b.capacity, 0);
  const totalPassengers = buses.reduce((sum, b) => sum + (b.capacity - b.seatsAvailable), 0);
  const avgOccupancyPct = totalCapacity > 0 ? Math.round((totalPassengers / totalCapacity) * 100) : 0;
  const customRoutes = routes.filter((r) => r.id.startsWith('route-custom-'));
  const colorOptions = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f97316'];

  // Map Click Handler for Route Manager
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (activeTab === 'routes') {
          setNewRoutePoints((prev) => [...prev, [e.latlng.lat, e.latlng.lng]]);
        }
      },
    });
    return null;
  };

  const handleSaveRoute = () => {
    if (newRoutePoints.length < 3) return;
    setRouteName('');
    setRouteColor('#ef4444');
    setRouteDetailsOpen(true);
  };

  const handleCreateRoute = () => {
    const trimmed = routeName.trim();
    if (newRoutePoints.length < 3 || !trimmed) return;
    const id = `route-custom-${Date.now()}`;
    const loopedPath = [...newRoutePoints, newRoutePoints[0]];
    addRoute({
      id,
      name: trimmed,
      color: routeColor,
      path: loopedPath,
      stops: newRoutePoints.map((pt, idx) => ({
        id: `${id}-stop-${idx + 1}`,
        name: `Stop ${idx + 1}`,
        location: pt,
      })),
    });
    setNewRoutePoints([]);
    setRouteDetailsOpen(false);
  };

  const handleClearDraft = () => {
    setNewRoutePoints([]);
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto bg-slate-50">
      
      {/* Navigation Tabs */}
      <div className="flex gap-4 shrink-0">
        <button 
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-full font-semibold transition-colors shadow-sm border border-slate-200 ${activeTab === 'fleet' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('routes')}
          className={`px-4 py-2 rounded-full font-semibold transition-colors shadow-sm border border-slate-200 ${activeTab === 'routes' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
        >
          <div className="flex items-center gap-2">
            <MapIcon size={20} />
            <span>Route Manager</span>
          </div>
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-full font-semibold transition-colors shadow-sm border border-slate-200 ${activeTab === 'analytics' ? 'bg-indigo-700 text-white border-indigo-700' : 'bg-white text-slate-700 hover:bg-slate-50'}`}
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-4 rounded-full bg-indigo-50 text-indigo-700">
                <Bus size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{buses.length}</p>
                <p className="text-sm text-slate-500 font-medium">Active Buses</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="p-4 rounded-full bg-green-50 text-green-600">
                <Users size={24} />
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-800">{avgOccupancyPct}%</p>
                <p className="text-sm text-slate-500 font-medium">Avg Occupancy</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-125 flex-1">
            {/* Left Column: Fleet Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
                <h3 className="text-lg font-bold text-slate-800">Fleet Status</h3>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Bus ID</th>
                      <th className="px-6 py-4">Route</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Occupancy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {buses.map(bus => {
                      const route = routes.find(r => r.id === bus.routeId);
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
                              ${bus.status === 'moving' ? 'bg-teal-50 text-teal-700' : 
                                bus.status === 'delayed' ? 'bg-rose-50 text-rose-600' :
                                bus.status === 'breakdown' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}
                            `}>
                              <span className={`w-1.5 h-1.5 rounded-full ${bus.status === 'moving' ? 'bg-teal-600' : bus.status === 'delayed' ? 'bg-rose-600' : bus.status === 'breakdown' ? 'bg-rose-600' : 'bg-slate-400'}`}></span>
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
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-4 relative z-0 h-full min-h-100">
              <MapContainer center={[51.505, -0.09]} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
                <TileLayer 
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {routes.map(route => (
                  <Polyline key={route.id} positions={route.path} color={route.color} weight={4} opacity={0.6} />
                ))}

                {buses.map(bus => {
                  const route = routes.find(r => r.id === bus.routeId);
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
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative p-4 h-full">
           <div className="absolute top-8 right-8 z-1000 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
             <p className="text-sm font-bold text-slate-800 mb-3">Route Builder</p>
             <div className="flex items-center justify-between gap-4 mb-3">
               <span className="text-xs text-slate-500">Points Added</span>
               <span className="text-sm font-mono text-indigo-700 font-bold">{newRoutePoints.length}</span>
             </div>
             <button 
               onClick={handleSaveRoute}
              disabled={newRoutePoints.length < 3}
               className="w-full bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-indigo-700"
             >
               Save New Route
             </button>
             <button
               onClick={handleClearDraft}
               disabled={newRoutePoints.length === 0}
               className="mt-2 w-full bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-slate-200"
             >
               Clear Draft
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
               <Polyline positions={newRoutePoints} color="#4338CA" dashArray="5, 10" weight={3} />
             )}
             {newRoutePoints.map((pt, i) => (
               <Marker key={i} position={pt} />
             ))}
             
            {customRoutes.map(route => (
              <Polyline key={route.id} positions={route.path} color={route.color} weight={4} opacity={0.7} />
            ))}
           </MapContainer>

           {routeDetailsOpen && (
             <div className="absolute inset-0 z-1100 flex items-center justify-center p-6">
               <button
                 type="button"
                 className="absolute inset-0 bg-black/40"
                 onClick={() => setRouteDetailsOpen(false)}
                 aria-label="Close"
               />
               <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                 <div className="flex items-start justify-between gap-4">
                   <div>
                     <h2 className="text-xl font-bold text-slate-900">Route Details</h2>
                     <p className="text-sm text-slate-600 mt-1">Name your route and choose a color.</p>
                   </div>
                   <button
                     type="button"
                     onClick={() => setRouteDetailsOpen(false)}
                     className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
                     aria-label="Close"
                   >
                     <X size={18} className="text-slate-700" />
                   </button>
                 </div>

                 <div className="mt-6 space-y-5">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Route Name</label>
                     <input
                       value={routeName}
                       onChange={(e) => setRouteName(e.target.value)}
                       type="text"
                       className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                       placeholder="Red Loop"
                     />
                   </div>

                   <div>
                     <div className="block text-sm font-semibold text-slate-700 mb-2">Route Color</div>
                     <div className="flex items-center gap-3">
                       {colorOptions.map((c) => (
                         <button
                           key={c}
                           type="button"
                           onClick={() => setRouteColor(c)}
                           className={`h-10 w-10 rounded-full border border-slate-200 shadow-sm ${routeColor === c ? 'ring-2 ring-black ring-offset-2 ring-offset-white' : ''}`}
                           style={{ backgroundColor: c }}
                           aria-label={`Select color ${c}`}
                         />
                       ))}
                     </div>
                   </div>

                   <div className="flex gap-3">
                     <button
                       type="button"
                       onClick={() => setRouteDetailsOpen(false)}
                       className="flex-1 bg-white hover:bg-slate-50 text-slate-800 py-3 px-6 rounded-full shadow-sm border border-slate-200 font-bold transition-colors"
                     >
                       Cancel
                     </button>
                     <button
                       type="button"
                       onClick={handleCreateRoute}
                       disabled={newRoutePoints.length < 3 || routeName.trim().length === 0}
                       className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-3 px-6 rounded-full shadow-sm border border-indigo-700 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Create Route
                     </button>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Peak Occupancy Trends</h3>
            <div className="h-90 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={OCCUPANCY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    contentStyle={{ backgroundColor: '#FFF', borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Bar dataKey="passengers" fill="#4338CA" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-w-0">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Current Occupancy by Route</h3>
            <div className="h-90 w-full min-w-0">
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
                  <Bar dataKey="occupancy" fill="#4338CA" radius={[4, 4, 0, 0]} barSize={40} />
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
