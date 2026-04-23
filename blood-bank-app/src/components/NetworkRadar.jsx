import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { Navigation, Droplet, Activity } from 'lucide-react';

// Fix for default Leaflet icon issues in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulsing icon for Hubs
const hubIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: "<div style='background-color:#ef4444;' class='marker-pin'></div><i class='fa fa-circle'></i>",
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

const LiveNetworkMap = () => {
  const [hubs, setHubs] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [userLocation, setUserLocation] = useState([30.9010, 75.8573]); // Ludhiana Default
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hubRes, invRes] = await Promise.all([
          axios.get('http://localhost:5000/api/hubs'),
          axios.get('http://localhost:5000/api/inventory')
        ]);
        setHubs(hubRes.data);
        setInventory(invRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Map Sync Failed", err);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
      });
    }
    fetchData();
  }, []);

  const getHubStock = (hubId) => {
    return inventory.filter(u => (u.hubId === hubId || u.hubId?._id === hubId)).length;
  };

  const calculateDistance = (lat2, lon2) => {
    const [lat1, lon1] = userLocation;
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

  if (loading) return <div className="h-[500px] flex items-center justify-center font-black uppercase text-slate-400">Loading Satellite Uplink...</div>;

  return (
    <div className="h-[600px] w-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl relative">
      <MapContainer center={userLocation} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        {/* Modern Map Tiles (Stadia or OSM) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {/* User Current Position */}
        <Marker position={userLocation}>
          <Popup>
            <div className="font-black uppercase italic text-blue-600">Your Command Post</div>
          </Popup>
        </Marker>

        {/* Hub Locations */}
        {hubs.map((hub) => (
          <Marker 
            key={hub._id} 
            position={[hub.location.lat, hub.location.lng]}
          >
            <Popup className="custom-popup">
              <div className="p-2 space-y-3 min-w-[200px]">
                <div className="border-b pb-2">
                  <h3 className="font-black uppercase text-red-600 italic leading-none">{hub.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{hub.address}</p>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Navigation size={12}/> Distance</span>
                  <span className="text-xs font-black text-slate-900">{calculateDistance(hub.location.lat, hub.location.lng)} KM</span>
                </div>

                <div className="flex justify-between items-center bg-red-50 p-2 rounded-xl">
                  <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1"><Droplet size={12}/> Live Stock</span>
                  <span className="text-xs font-black text-red-600">{getHubStock(hub._id)} Units</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CSS for pulsing effects */}
      <style>{`
        .marker-pin {
          width: 20px;
          height: 20px;
          border-radius: 50% 50% 50% 0;
          position: absolute;
          transform: rotate(-45deg);
          left: 50%;
          top: 50%;
          margin: -15px 0 0 -15px;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </div>
  );
};

export default LiveNetworkMap;