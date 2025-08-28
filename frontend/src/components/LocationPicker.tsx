/// <reference types="vite/client" />
/// <reference types="@types/google.maps" />
import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { useTheme } from 'next-themes';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { darkMapStyles, lightMapStyles } from '../lib/mapStyles';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string };
}

const LocationPicker = ({ onLocationSelect, initialLocation }: LocationPickerProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(initialLocation?.address || '');
  const { theme } = useTheme();
  const { toast } = useToast();

  // Initialize the map
  useEffect(() => {
    const initMap = async () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey) {
        console.error('Google Maps API key not found');
        toast({
          title: "Configuration Error",
          description: "Google Maps API key is missing. Please contact support.",
          variant: "destructive"
        });
        return;
      }
      
      // Check if API key is properly configured
      if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.length < 10) {
        console.error('Google Maps API key is not properly configured');
        toast({
          title: "Configuration Error",
          description: "Google Maps is not properly configured. Please contact support.",
          variant: "destructive"
        });
        return;
      }

      try {
        console.log('Loading Google Maps with API key:', apiKey.substring(0, 10) + '...');
        
        const loader = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['maps', 'marker', 'places']
        });

        await loader.load();
        console.log('Google Maps loaded successfully');
        
        // Verify that required libraries are loaded
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          console.error('Google Maps libraries not loaded properly');
          toast({
            title: "Map Error",
            description: "Google Maps libraries are not loaded properly. Please refresh the page and try again.",
            variant: "destructive"
          });
          return;
        }
        
        if (mapRef.current) {
          // Default to Sri Lanka if no initial location
          const defaultCenter = initialLocation
            ? { lat: initialLocation.lat, lng: initialLocation.lng }
            : { lat: 7.8731, lng: 80.7718 }; // Center of Sri Lanka

          const mapStyles = theme === 'dark' ? darkMapStyles : lightMapStyles;
          
          const map = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            styles: mapStyles
          });

          mapInstanceRef.current = map;

          // Create marker
          const marker = new google.maps.Marker({
            position: defaultCenter,
            map: map,
            draggable: true,
            title: 'Drag to select location'
          });

          markerRef.current = marker;

          // Update location when marker is dragged
          marker.addListener('dragend', () => {
            const position = marker.getPosition();
            if (position) {
              reverseGeocode(position.lat(), position.lng());
            }
          });

          // Add click listener on map
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              marker.setPosition(e.latLng);
              reverseGeocode(e.latLng.lat(), e.latLng.lng());
            }
          });

          // Initialize autocomplete after a short delay to ensure DOM is ready
          setTimeout(() => {
            // Check if Google Maps is loaded
            if (typeof google === 'undefined' || !google.maps) {
              console.error('Google Maps not loaded');
              toast({
                title: "Map Error",
                description: "Google Maps is not loaded properly. Please refresh the page and try again.",
                variant: "destructive"
              });
              return;
            }
            
            const input = document.getElementById('location-search') as HTMLInputElement;
            if (input) {
              console.log('Initializing autocomplete');
              try {
                // Check if google.maps.places is available
                if (!google.maps.places) {
                  console.error('Google Maps Places library not loaded');
                  toast({
                    title: "Search Error",
                    description: "Location search is not available. You can still click on the map to select a location.",
                    variant: "destructive"
                  });
                  return;
                }
                
                // Check if the API key has places API enabled
                if (typeof google.maps.places.Autocomplete === 'undefined') {
                  console.error('Google Maps Places Autocomplete not available');
                  toast({
                    title: "Search Error",
                    description: "Location search is not properly configured. Please contact support.",
                    variant: "destructive"
                  });
                  return;
                }
                
                const autocomplete = new google.maps.places.Autocomplete(input, {
                  bounds: new google.maps.LatLngBounds(
                    new google.maps.LatLng(5.916667, 79.516667), // Southwest corner of Sri Lanka
                    new google.maps.LatLng(9.833333, 81.883333)  // Northeast corner of Sri Lanka
                  ),
                  strictBounds: true,
                  fields: ["formatted_address", "geometry", "name"]
                });
                
                // Set autocomplete styling based on theme
                const autocompleteStyle = {
                  color: theme === 'dark' ? '#ffffff' : '#000000',
                  backgroundColor: theme === 'dark' ? '#1e1e1e' : '#ffffff'
                };
                
                // Apply styling to the input element
                if (input) {
                  input.style.color = autocompleteStyle.color;
                  input.style.backgroundColor = autocompleteStyle.backgroundColor;
                }
                
                autocompleteRef.current = autocomplete;
                
                autocomplete.addListener('place_changed', () => {
                  try {
                    const place = autocomplete.getPlace();
                    console.log('Place changed:', place);
                    if (!place) {
                      console.warn('No place returned from autocomplete');
                      toast({
                        title: "Location Error",
                        description: "Could not retrieve location information. Please try again.",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    if (!place.geometry || !place.geometry.location) {
                      console.warn('Place geometry not found');
                      toast({
                        title: "Location not found",
                        description: "Please select a valid location from the suggestions",
                        variant: "destructive"
                      });
                      return;
                    }
                    
                    const location = {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                      address: place.formatted_address || place.name || ''
                    };
                    
                    console.log('Selected location:', location);
                    // Update map and marker
                    map.panTo(place.geometry.location);
                    marker.setPosition(place.geometry.location);
                    setSearchInput(location.address);
                    onLocationSelect(location);
                  } catch (error: any) {
                    console.error('Error in place_changed listener:', error);
                    // Check if it's a Google Maps API error
                    if (error.message && error.message.includes('Google')) {
                      toast({
                        title: "Google Maps Error",
                        description: "There was an issue with Google Maps. Please try again later.",
                        variant: "destructive"
                      });
                    } else {
                      toast({
                        title: "Selection Error",
                        description: "Error processing selected location. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }
                });
                console.log('Autocomplete initialized successfully');
              } catch (error) {
                console.error('Error initializing autocomplete:', error);
                toast({
                  title: "Search Error",
                  description: "Location search is not available. You can still click on the map to select a location.",
                  variant: "destructive"
                });
              }
            } else {
              console.warn('Location search input not found');
            }
          }, 500);
        }
      } catch (error: any) {
        console.error('Error loading Google Maps:', error);
        // Check if it's a billing error
        if (error.message && error.message.includes('Billing')) {
          toast({
            title: "Map Error",
            description: "Google Maps is not properly configured. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Map Error",
            description: "Failed to load map. Please check your internet connection and try again.",
            variant: "destructive"
          });
        }
      }
    };

    initMap();

    // Cleanup listeners on unmount
    return () => {
      if (autocompleteRef.current) {
        // Remove autocomplete listeners
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [initialLocation, toast, theme]);
  
  // Automatically fetch current location when component mounts and no initial location is provided
  useEffect(() => {
    // Only fetch current location if no initial location is provided
    if (!initialLocation) {
      // Add a delay to ensure the map and Google Maps API are fully initialized
      const timer = setTimeout(() => {
        // Check if map is initialized before trying to get current location
        if (mapInstanceRef.current && markerRef.current) {
          getCurrentLocation();
        }
      }, 1500);
      
      // Clean up the timer
      return () => clearTimeout(timer);
    }
  }, []); // Empty dependency array means this runs once when component mounts
  
  // Update map styles when theme changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const mapStyles = theme === 'dark' ? darkMapStyles : lightMapStyles;
      mapInstanceRef.current.setOptions({ styles: mapStyles });
    }
    
    // Note: Using default Google Maps marker which doesn't require theme-based styling
    
    // Update autocomplete input styling when theme changes
    const input = document.getElementById('location-search') as HTMLInputElement;
    if (input) {
      // Check if we have a valid API key before trying to style
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
      if (apiKey && apiKey !== 'YOUR_API_KEY_HERE' && apiKey.length >= 10) {
        input.style.color = theme === 'dark' ? '#ffffff' : '#000000';
        input.style.backgroundColor = theme === 'dark' ? '#1e1e1e' : '#ffffff';
      }
    }
  }, [theme]);

  // Reverse geocode coordinates to get address
  const reverseGeocode = async (lat: number, lng: number) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey) {
      console.error('Google Maps API key not found for reverse geocoding');
      return;
    }
    
    // Check if API key is properly configured
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.length < 10) {
      console.error('Google Maps API key is not properly configured for reverse geocoding');
      return;
    }

    try {
      console.log(`Reverse geocoding coordinates: ${lat}, ${lng}`);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=en&region=LK`
      );
      
      const data = await response.json();
      console.log('Reverse geocoding response:', data);
      if (data.results && data.results[0]) {
        const address = data.results[0].formatted_address;
        setSearchInput(address);
        onLocationSelect({ lat, lng, address });
      } else {
        console.warn('No results found for reverse geocoding');
        // Still update with coordinates if we can't get address
        onLocationSelect({
          lat,
          lng,
          address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
        });
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      // Still update with coordinates if we can't get address
      onLocationSelect({
        lat,
        lng,
        address: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`
      });
    }
  };

  // Get current location using Geolocation API
  const getCurrentLocation = () => {
    // Check if API key is properly configured
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE' || apiKey.length < 10) {
      console.error('Google Maps API key is not properly configured for geolocation');
      toast({
        title: "Configuration Error",
        description: "Google Maps is not properly configured. Please contact support.",
        variant: "destructive"
      });
      return;
    }
    
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation",
        variant: "destructive"
      });
      return;
    }

    console.log('Getting current location...');
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation success:', position);
        const { latitude, longitude } = position.coords;
        console.log(`Current position: ${latitude}, ${longitude}`);
        
        if (mapInstanceRef.current && markerRef.current) {
          const location = new google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.panTo(location);
          markerRef.current.setPosition(location);
          reverseGeocode(latitude, longitude);
        }
        
        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            id="location-search"
            type="text"
            placeholder="Search for a location..."
            className="pl-10 input-crime"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
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
      
      <div 
        ref={mapRef} 
        className="rounded-lg overflow-hidden border border-border h-80 w-full"
        style={{ width: '100%' }}
      />
      
      <p className="text-sm text-muted-foreground">
         Click on the map, or drag the marker to select a precise location.
      </p>
    </div>
  );
};

export default LocationPicker;