import { AlertTriangle, Clock, MapPin } from 'lucide-react';

const NewsTicker = () => {
  const newsItems = [
    { id: 1, text: "BREAKING: Armed robbery reported in Colombo 03", location: "Colombo", time: "2 min ago" },
    { id: 2, text: "ALERT: Missing person case - Rajitha Fernando, age 45", location: "Kandy", time: "15 min ago" },
    { id: 3, text: "UPDATE: Cybercrime unit arrests 3 suspects in online fraud", location: "Galle", time: "1 hour ago" },
    { id: 4, text: "URGENT: Vehicle theft reported - Red Toyota Prius", location: "Negombo", time: "2 hours ago" },
    { id: 5, text: "RESOLVED: Hit and run case closed with arrest", location: "Matara", time: "4 hours ago" },
  ];

  return (
    <div className="crime-tape overflow-hidden relative">
      <div className="flex items-center py-2">
        <div className="flex items-center mr-8">
          <AlertTriangle className="h-5 w-5 text-black mr-2 animate-pulse" />
          <span className="font-black text-sm">CRIME ALERTS</span>
        </div>
        
        <div className="news-ticker">
          {newsItems.map((item, index) => (
            <div key={`${item.id}-${index}`} className="flex items-center mx-8 text-sm">
              <span className="font-semibold text-black">{item.text}</span>
              <div className="flex items-center ml-4 text-black/80">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="mr-2">{item.location}</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>{item.time}</span>
              </div>
              <span className="mx-4 text-black">●</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;