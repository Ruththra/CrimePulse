import { useState } from 'react';
import { MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import sriLankaHeatmap from '../assets/srilanka-map.png';

const HeatMap = () => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const crimeZones = [
    { id: 1, name: "Colombo", crimes: 145, riskLevel: "High", x: 45, y: 65 },
    { id: 2, name: "Kandy", crimes: 89, riskLevel: "Medium", x: 55, y: 45 },
    { id: 3, name: "Galle", crimes: 67, riskLevel: "Medium", x: 40, y: 80 },
    { id: 4, name: "Negombo", crimes: 34, riskLevel: "Low", x: 42, y: 60 },
    { id: 5, name: "Matara", crimes: 23, riskLevel: "Low", x: 38, y: 88 },
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case "High": return "bg-destructive";
      case "Medium": return "bg-yellow-500";
      case "Low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="card-crime p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <TrendingUp className="h-6 w-6 mr-2 text-primary" />
        Sri Lanka Crime Heat Map
      </h3>
      
      <div className="relative aspect-[4/3] bg-gradient-to-br from-background to-secondary rounded-lg overflow-hidden">
        <img 
          src={sriLankaHeatmap} 
          alt="Sri Lanka Heat Map" 
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Crime Zone Markers */}
        {crimeZones.map((zone) => (
          <div
            key={zone.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
            onMouseEnter={() => setSelectedZone(zone.name)}
            onMouseLeave={() => setSelectedZone(null)}
          >
            <div className={`w-4 h-4 rounded-full ${getRiskColor(zone.riskLevel)} animate-pulse border-2 border-white shadow-lg`}>
              <div className={`w-8 h-8 rounded-full ${getRiskColor(zone.riskLevel)} opacity-30 absolute -top-2 -left-2 animate-ping`}></div>
            </div>
            
            {selectedZone === zone.name && (
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg p-3 shadow-xl z-10 min-w-[150px]">
                <h4 className="font-semibold text-sm">{zone.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {zone.crimes} reported crimes
                </p>
                <div className="flex items-center mt-1">
                  <AlertCircle className="h-3 w-3 mr-1 text-primary" />
                  <span className={`text-xs font-medium ${
                    zone.riskLevel === 'High' ? 'text-destructive' :
                    zone.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {zone.riskLevel} Risk
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-destructive mr-2"></div>
            <span>High Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Medium Risk</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Low Risk</span>
          </div>
        </div>
        <span className="text-muted-foreground">Updated 5 min ago</span>
      </div>
    </div>
  );
};

export default HeatMap;