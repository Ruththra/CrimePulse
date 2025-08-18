// <reference types="vite/client" />
// <reference types="@types/google.maps" />
import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { TrendingUp } from 'lucide-react';

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

const HeatMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<typeof districts[0] | null>(null);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);

  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey) {
        console.error('Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file');
        return;
      }

      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['maps', 'marker']
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          const googleMap = new google.maps.Map(mapRef.current, {
            center: { lat: 7.8731, lng: 80.7718 },
            zoom: 8,
            styles: [
              {
                featureType: 'all',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }]
              },
              {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }]
              }
            ]
          });

          setMap(googleMap);

          // Add markers for each district
          districts.forEach((district) => {
            const marker = new google.maps.Marker({
              position: { lat: district.lat, lng: district.lng },
              map: googleMap,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: district.color,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              },
              title: district.name
            });

            // Create info window
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 12px; min-width: 200px;">
                  <div style="font-weight: 600; font-size: 16px; margin-bottom: 8px; color: #1e293b;">${district.name}</div>
                  <div style="font-size: 14px; color: #475569; margin-bottom: 4px;">${district.crimes} reported crimes</div>
                  <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                    <span style="display: inline-block; width: 12px; height: 12px; border-radius: 9999px; background: ${district.color};"></span>
                    <span style="font-weight: 500; color: #374151;">${district.riskLevel} Risk</span>
                  </div>
                </div>
              `
            });

            // Add circle for 1km radius
            new google.maps.Circle({
              strokeColor: district.color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: district.color,
              fillOpacity: 0.15,
              map: googleMap,
              center: { lat: district.lat, lng: district.lng },
              radius: 1000 // 1km in meters
            });

            // Add click listener
            marker.addListener('click', () => {
              // Close all other info windows
              infoWindowsRef.current.forEach(iw => iw.close());
              
              infoWindow.open(googleMap, marker);
              setSelectedDistrict(district);
            });

            infoWindowsRef.current.push(infoWindow);
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      // Cleanup info windows
      infoWindowsRef.current.forEach(iw => iw.close());
    };
  }, []);

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

      <div 
        ref={mapRef} 
        className="rounded-lg overflow-hidden border border-border h-[520px]"
        style={{ width: '100%' }}
      />

      {legend}
    </div>
  );
};

export default HeatMap;
