import React, { useEffect, useState } from 'react';
import { useBus } from '../context/BusContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import { AlertTriangle, Square, Users, Navigation, Play } from 'lucide-react';
import { BUS_ROUTES } from '../data/mockData';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Bus Icon
const createBusIcon = (color: string) => L.divIcon({
  className: 'custom-bus-icon',
  html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4.34a3 3 0 0 0-2.91 2.27L.36 11.54c-.24.959-.24 1.962 0 2.92l.64 2.54h2"></path><path d="M14 17H9"></path><circle cx="6.5" cy="17.5" r="2.5"></circle><circle cx="16.5" cy="17.5" r="2.5"></circle></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Component to recenter map on bus
const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
};

const InvalidateLeafletSize: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
};

const Driver: React.FC = () => {
  const { buses, userBusId, resumeTrip, stopTrip, reportEmergency, updateSeats, userRole } = useBus();
  const [passengers, setPassengers] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRole) {
      navigate('/');
    }
  }, [userRole, navigate]);

  const myBus = buses.find((b) => b.id === userBusId);
  const myRoute = BUS_ROUTES.find((r) => r.id === myBus?.routeId);

  if (!myBus || !myRoute) return <div className="h-full flex items-center justify-center bg-slate-50 text-slate-500">Loading Bus System...</div>;

  const nextStop = myRoute.stops[myBus.nextStopIdx];

  const handleUpdateSeats = (change: number) => {
    const newCount = Math.max(0, passengers + change);
    setPassengers(newCount);
    updateSeats(myBus.id, newCount);
  };

  const handleDepart = () => resumeTrip(myBus.id);

  return (
    <div className="h-full flex flex-col relative font-sans bg-slate-50 p-6 gap-4">
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between shadow-sm z-10 rounded-xl">
        <div className="flex items-center gap-3">
          <Navigation className="text-blue-200" size={24} />
          <div>
            <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Next Stop</p>
            <h1 className="text-xl font-bold leading-none">{nextStop?.name || 'End of Line'}</h1>
          </div>
        </div>
        <div className="text-right">
           <p className="text-xs text-blue-200 uppercase font-bold tracking-wider">Status</p>
           <p className="font-bold text-white">
             {myBus.status === 'moving' ? 'IN TRANSIT' : myBus.status.toUpperCase()}
           </p>
        </div>
      </div>

      <div className="w-full max-w-md aspect-square mx-auto relative z-0 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <MapContainer center={myBus.location} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <InvalidateLeafletSize />
          <Polyline positions={myRoute.path} color={myRoute.color} weight={6} opacity={0.8} />
          
          {myRoute.stops.map(stop => (
            <Marker key={stop.id} position={stop.location}>
              <Popup className="custom-popup">
                <div className="font-bold text-gray-800">{stop.name}</div>
              </Popup>
            </Marker>
          ))}

          <Marker position={myBus.location} icon={createBusIcon(myRoute.color)} zIndexOffset={1000} />
          
          <RecenterMap center={myBus.location} />
        </MapContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 z-20 sticky bottom-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-stretch">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-lg border border-slate-200">
            <Users className="text-blue-600" size={24} />
            <div>
              <div className="text-xl font-bold text-slate-800 leading-none">{passengers} / {myBus.capacity}</div>
              <div className="text-xs text-slate-500 font-bold uppercase">Seats Taken</div>
            </div>
          </div>

          <button 
            onClick={() => reportEmergency(myBus.id, 'breakdown')}
            className="h-14 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 rounded-lg px-4 py-2 font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <AlertTriangle size={24} />
            Report Issue
          </button>

          <button 
            onClick={() => stopTrip(myBus.id)}
            className="h-14 bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Square size={24} fill="currentColor" />
            Stop
          </button>

          <button 
            onClick={() => resumeTrip(myBus.id)}
            className="h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium text-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Play className="w-6 h-6 fill-current" />
            Resume Trip
          </button>
        </div>
      </div>

      {/* Safety Modal - Only shows when at a stop */}
      {myBus.isAtStop && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-2xl border border-slate-100 space-y-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Navigation className="text-blue-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Arrived at Stop</h2>
              <p className="text-slate-500 text-lg">{nextStop?.name}</p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => handleUpdateSeats(-1)}
                className="w-16 h-16 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-3xl transition-colors"
              >
                -
              </button>
              <div className="text-center min-w-[80px]">
                <div className="text-4xl font-bold text-slate-800 tabular-nums">{passengers}</div>
                <div className="text-xs text-slate-500 uppercase font-bold mt-1">On Board</div>
              </div>
              <button 
                onClick={() => handleUpdateSeats(1)}
                className="w-16 h-16 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white font-bold text-3xl transition-colors"
              >
                +
              </button>
            </div>

            <button 
              onClick={handleDepart}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium text-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Depart Station</span>
              <Play className="w-5 h-5 fill-current" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Driver;
