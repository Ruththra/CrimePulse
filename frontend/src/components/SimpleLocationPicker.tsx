import { useState } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';

interface SimpleLocationPickerProps {
  onLocationSelect: (location: { lat: number | null; lng: number | null; address: string }) => void;
  initialLocation?: { lat: number | null; lng: number | null; address: string };
}

const SimpleLocationPicker = ({ onLocationSelect, initialLocation }: SimpleLocationPickerProps) => {
  const [locationInput, setLocationInput] = useState(initialLocation?.address || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get current location using Geolocation API
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // For now, we'll just use the coordinates since we can't reverse geocode without Google Maps
        const locationString = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
        setLocationInput(locationString);
        
        onLocationSelect({
          lat: latitude,
          lng: longitude,
          address: locationString
        });
        
        setIsLoading(false);
      },
      (error) => {
        setIsLoading(false);
        
        let errorMessage = "Unable to get your current location. Please try again or enter manually.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions for this site.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "The request to get your location timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    
    // If the user is typing a location, clear the coordinates
    onLocationSelect({
      lat: null,
      lng: null,
      address: value
    });
  };

  const handleSearch = () => {
    // In a simple version, we just pass the text input as the location
    // In a more advanced version, we could integrate with a location search API
    if (locationInput.trim()) {
      onLocationSelect({
        lat: null,
        lng: null,
        address: locationInput
      });
      
      toast({
        title: "Location Set",
        description: "Location has been set to the entered text.",
        variant: "success"
      });
    } else {
      toast({
        title: "Location Required",
        description: "Please enter a location or use the current location button.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter location or landmark..."
            className="pl-10 input-crime"
            value={locationInput}
            onChange={handleLocationInput}
          />
        </div>
        <Button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="btn-crime"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Locating...
            </div>
          ) : (
            <div className="flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Current Location
            </div>
          )}
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          onClick={handleSearch}
          className="btn-crime"
        >
          <MapPin className="h-5 w-5 mr-2" />
          Use This Location
        </Button>
      </div>
      
      <div className="rounded-lg border border-border h-80 w-full bg-gray-100 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium">Location Map Unavailable</p>
          <p className="text-sm mt-2">Enter a location above or use the current location button</p>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Enter a location manually or use the current location button. For better experience, 
        enable location services in your browser.
      </p>
    </div>
  );
};

export default SimpleLocationPicker;