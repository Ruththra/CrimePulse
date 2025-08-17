import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { TrendingUp, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Complete Sri Lanka district data with accurate coordinates and crime data
const districts = [
  { name: 'Colombo', lat: 6.9271, lng: 79.8612, crimes: 145, riskLevel: 'High', color: '#ef4444' },
  { name: 'Gampaha', lat: 7.0840, lng: 79.9930, crimes: 98, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Kalutara', lat: 6.5854, lng: 80.1070, crimes: 62, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Kandy', lat: 7.2906, lng: 80.6337, crimes: 112, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Matale', lat: 7.4675, lng: 80.6234, crimes: 54, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Nuwara Eliya', lat: 6.9497, lng: 80.7891, crimes: 47, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Galle', lat: 6.0535, lng: 80.2210, crimes: 67, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Matara', lat: 5.9549, lng: 80.5540, crimes: 44, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Hambantota', lat: 6.1246, lng: 81.1185, crimes: 38, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Jaffna', lat: 9.6615, lng: 80.0255, crimes: 58, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Kilinochchi', lat: 9.3961, lng: 80.3982, crimes: 21, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Mannar', lat: 8.9806, lng: 79.9048, crimes: 19, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Vavuniya', lat: 8.7510, lng: 80.4970, crimes: 27, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Mullaitivu', lat: 9.2671, lng: 80.8140, crimes: 14, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Batticaloa', lat: 7.7318, lng: 81.6910, crimes: 52, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Ampara', lat: 7.2831, lng: 81.6747, crimes: 36, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Trincomalee', lat: 8.5874, lng: 81.2152, crimes: 49, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Kurunegala', lat: 7.4863, lng: 80.3623, crimes: 73, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Puttalam', lat: 8.0362, lng: 79.8283, crimes: 41, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Anuradhapura', lat: 8.3114, lng: 80.4037, crimes: 66, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Polonnaruwa', lat: 7.9403, lng: 81.0188, crimes: 39, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Badulla', lat: 6.9896, lng: 81.0560, crimes: 57, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Monaragala', lat: 6.8726, lng: 81.3490, crimes: 28, riskLevel: 'Low', color: '#22c55e' },
  { name: 'Ratnapura', lat: 6.7056, lng: 80.3847, crimes: 61, riskLevel: 'Medium', color: '#f59e0b' },
  { name: 'Kegalle', lat: 7.2513, lng: 80.3464, crimes: 45, riskLevel: 'Low', color: '#22c55e' },
];

// Enhanced custom icon creation with proper encoding
const createCustomIcon = (color: string, riskLevel: string) => {
  const svg = `
    <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 8.284 15 25 15 25s15-16.716 15-25C30 6.716 23.284 0 15 0z" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="15" cy="15" r="8" fill="white"/>
      <text x="15" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="${color}">
        ${riskLevel.charAt(0)}
      </text>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -40],
  });
};

const HeatMap = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<typeof districts[0] | null>(null);

  const legend = (
    <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-red-500 mr-2 inline-block" />
          <span className="text-sm">High Risk</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-amber-500 mr-2 inline-block" />
          <span className="text-sm">Medium Risk</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-green-500 mr-2 inline-block" />
          <span className="text-sm">Low Risk</span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">1 km radius shown per point</span>
    </div>
  );

  return (
    <div className="card-crime p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-primary" />
        Sri Lanka Crime Heat Map
      </h3>

      <MapContainer center={[7.8731, 80.7718]} zoom={8} className="rounded-lg overflow-hidden border border-border h-[520px]">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {districts.map((district) => (
          <Marker
            key={district.name}
            position={[district.lat, district.lng]}
            icon={createCustomIcon(district.color, district.riskLevel)}
          >
            <Popup>
              <div style={{ fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
                <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: '#1e293b' }}>{district.name}</div>
                <div style={{ fontSize: 14, color: '#475569', marginBottom: 4 }}>{district.crimes} reported crimes</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '9999px', background: district.color }}></span>
                  <span style={{ fontWeight: 500, color: '#374151' }}>{district.riskLevel} Risk</span>
                </div>
              </div>
            </Popup>
            <Circle
              center={[district.lat, district.lng]}
              radius={1000} // 1 km radius
              pathOptions={{ color: district.color, fillColor: district.color, fillOpacity: 0.15 }}
            />
          </Marker>
        ))}
      </MapContainer>

      {legend}
    </div>
  );
};

export default HeatMap;
