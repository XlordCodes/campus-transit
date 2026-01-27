import React, { useEffect, useState } from 'react';
import { useBus } from '../context/BusContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { Users, Clock } from 'lucide-react';
import { getDistance } from '../utils/geo';
import L from 'leaflet';

// Reusing the icon fix
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
  html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const InvalidateLeafletSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
};

const Student: React.FC = () => {
  const { buses, routes } = useBus();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-red');

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const selectedBus = buses.find(b => b.routeId === selectedRouteId);

  // Helper to estimate arrival time
  const getEta = (busLoc: [number, number], stopLoc: [number, number]) => {
    const dist = getDistance(busLoc[0], busLoc[1], stopLoc[0], stopLoc[1]);
    const speed = 20; // m/s
    const seconds = dist / speed;
    return Math.ceil(seconds / 60);
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 h-full overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Available Routes</h2>
          <p className="text-sm text-slate-500">Select a route to track</p>
        </div>
        
        <div className="p-4 space-y-3">
          {routes.map(route => {
            const bus = buses.find(b => b.routeId === route.id);
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:bg-slate-50
                  ${selectedRouteId === route.id ? 'border-indigo-700 bg-indigo-50' : 'border-slate-200 bg-white'}
                `}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">{route.name}</span>
                  {bus?.status === 'moving' ? (
                    <span className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded-full font-bold">On Time</span>
                  ) : bus?.status === 'delayed' ? (
                    <span className="bg-rose-50 text-rose-600 text-xs px-2 py-1 rounded-full font-bold">Delayed</span>
                  ) : bus?.status === 'breakdown' ? (
                    <span className="bg-rose-50 text-rose-600 text-xs px-2 py-1 rounded-full font-bold">Breakdown</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-full font-bold">Station</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Users size={16} className="text-indigo-700" />
                  <span>{bus?.seatsAvailable || 0} seats left</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto p-6 gap-6 bg-slate-50">
        
        {/* Top Section: Map */}
        <div className="bg-white rounded-xl shadow-sm p-4 h-96 shrink-0 border border-slate-200 relative z-0">
          {selectedRoute ? (
            <MapContainer 
              key={selectedRoute.id}
              center={selectedBus ? selectedBus.location : selectedRoute.path[0]} 
              zoom={15} 
              style={{ height: '100%', width: '100%', borderRadius: '0.75rem' }} 
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <InvalidateLeafletSize />
              <Polyline positions={selectedRoute.path} color={selectedRoute.color} weight={6} opacity={0.8} />
              
              {selectedRoute.stops.map(stop => (
                 <Marker key={stop.id} position={stop.location}>
                   <Popup className="custom-popup">
                     <div className="font-bold text-slate-800">{stop.name}</div>
                   </Popup>
                 </Marker>
              ))}

              {selectedBus && (
                <Marker position={selectedBus.location} icon={createBusIcon(selectedRoute.color)} zIndexOffset={1000}>
                  <Popup>
                     <div className="font-bold">{selectedRoute.name}</div>
                     <div>Seats: {selectedBus.seatsAvailable}</div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Select a route to view map</div>
          )}
        </div>

        {/* Bottom Section: Route Details */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 flex-1">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Upcoming Stops</h3>
          
          <div className="space-y-4">
            {selectedRoute?.stops.map((stop, idx) => {
              const bus = buses.find(b => b.routeId === selectedRoute.id);
              const isNext = bus?.nextStopIdx === idx;
              
              return (
                <div key={stop.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${isNext ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                    `}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{stop.name}</h4>
                      {isNext && <span className="text-xs text-blue-600 font-bold">Arriving Next</span>}
                    </div>
                  </div>
                  
                  {bus && (
                    <div className="flex items-center gap-2 text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
                      <Clock size={16} className="text-blue-600" />
                      <span className="font-mono font-bold">{getEta(bus.location, stop.location)} min</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Student;
