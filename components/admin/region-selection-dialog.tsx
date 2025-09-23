'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface RegionSelectionDialogProps {
  isOpen: boolean;
  onRegionSelect: (region: string) => void;
  onCancel: () => void;
}

interface LocationInfo {
  city: string;
  state: string;
  country: string;
  formatted_address: string;
  place_id: string;
}

interface GooglePlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

declare global {
  interface Window {
    google: any;
  }
}

export function RegionSelectionDialog({ isOpen, onRegionSelect, onCancel }: RegionSelectionDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<LocationInfo | null>(null);
  const [detectedLocation, setDetectedLocation] = useState<LocationInfo | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [searchResults, setSearchResults] = useState<GooglePlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const autocompleteService = useRef<any>(null);
  const geocoderService = useRef<any>(null);
  const placesService = useRef<any>(null);

  // Load Google Maps API
  useEffect(() => {
    if (isOpen && !window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        initializeGoogleServices();
      };
      document.head.appendChild(script);
    } else if (window.google) {
      setIsGoogleLoaded(true);
      initializeGoogleServices();
    }
  }, [isOpen]);

  // Search for places when search term changes
  useEffect(() => {
    if (searchTerm.trim() && isGoogleLoaded && autocompleteService.current) {
      const timer = setTimeout(() => {
        searchPlaces(searchTerm);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, isGoogleLoaded]);

  const initializeGoogleServices = () => {
    if (window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      geocoderService.current = new window.google.maps.Geocoder();
      
      // Create a dummy map element for PlacesService (required by Google Maps API)
      const mapDiv = document.createElement('div');
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: 20.5937, lng: 78.9629 }, // Center of India
        zoom: 5
      });
      placesService.current = new window.google.maps.places.PlacesService(map);
    }
  };

  const detectLocation = async () => {
    setIsDetecting(true);
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await reverseGeocode(latitude, longitude);
          },
          (error) => {
            console.error('Geolocation failed:', error);
            setIsDetecting(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        );
      } else {
        console.error('Geolocation not supported');
        setIsDetecting(false);
      }
    } catch (error) {
      console.error('Location detection failed:', error);
      setIsDetecting(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderService.current) return;

    const latlng = { lat, lng };
    
    geocoderService.current.geocode({ 
      location: latlng,
      result_type: ['street_address', 'route', 'neighborhood', 'sublocality', 'locality']
    }, (results: any[], status: string) => {
      if (status === 'OK' && results && results.length > 0) {
        // Try to find the most specific result first
        let bestResult = results[0];
        
        // Look for sublocality or neighborhood level results first
        for (const result of results) {
          const types = result.types;
          if (types.includes('sublocality_level_1') || 
              types.includes('neighborhood') || 
              types.includes('locality')) {
            bestResult = result;
            break;
          }
        }
        
        const locationInfo = extractLocationFromResult(bestResult);
        if (locationInfo && locationInfo.country.toLowerCase().includes('india')) {
          setDetectedLocation(locationInfo);
          setSelectedRegion(locationInfo);
        }
      }
      setIsDetecting(false);
    });
  };

  const searchPlaces = (query: string) => {
    if (!autocompleteService.current) return;

    setIsSearching(true);
    
    const request = {
      input: query,
      componentRestrictions: { country: 'in' }, // Restrict to India
      types: ['establishment', 'geocode'] // Include all types for more specific places
    };

    autocompleteService.current.getPlacePredictions(request, (predictions: GooglePlace[], status: string) => {
      setIsSearching(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        // Filter to prioritize specific localities over administrative areas
        const filteredPredictions = predictions.filter(prediction => {
          const description = prediction.description.toLowerCase();
          // Exclude very broad administrative areas
          return !description.includes('division') && 
                 !description.includes('district') && 
                 !description.includes('zone');
        });
        setSearchResults(filteredPredictions.slice(0, 10)); // Show more results
      } else {
        setSearchResults([]);
      }
    });
  };

  const handlePlaceSelect = (place: GooglePlace) => {
    if (!placesService.current) return;

    const request = {
      placeId: place.place_id,
      fields: ['address_components', 'formatted_address', 'place_id', 'name', 'types']
    };

    placesService.current.getDetails(request, (placeDetails: any, status: string) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && placeDetails) {
        const locationInfo = extractLocationFromPlaceDetails(placeDetails);
        if (locationInfo) {
          // If the place name is more specific than the extracted city, use the place name
          if (placeDetails.name && 
              placeDetails.name !== locationInfo.city && 
              placeDetails.name.length < 50) { // Avoid very long establishment names
            locationInfo.city = placeDetails.name;
          }
          
          setSelectedRegion(locationInfo);
          setSearchTerm('');
          setSearchResults([]);
        }
      }
    });
  };

  const extractLocationFromResult = (result: any): LocationInfo | null => {
    const components = result.address_components;
    let city = '';
    let state = '';
    let country = '';
    let locality = '';
    let sublocality = '';

    for (const component of components) {
      const types = component.types;
      
      // Priority order: sublocality_level_1 > locality > administrative_area_level_2 > administrative_area_level_3
      if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
        sublocality = component.long_name;
      } else if (types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_3')) {
        if (!locality) locality = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        if (!city) city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // Use the most specific available location
    const finalCity = sublocality || locality || city;

    if (finalCity && state && country) {
      return {
        city: finalCity,
        state,
        country,
        formatted_address: result.formatted_address,
        place_id: result.place_id
      };
    }
    return null;
  };

  const extractLocationFromPlaceDetails = (placeDetails: any): LocationInfo | null => {
    const components = placeDetails.address_components;
    let city = '';
    let state = '';
    let country = '';
    let locality = '';
    let sublocality = '';

    for (const component of components) {
      const types = component.types;
      
      // Priority order for most specific location
      if (types.includes('sublocality_level_1') || types.includes('neighborhood')) {
        sublocality = component.long_name;
      } else if (types.includes('sublocality_level_2')) {
        if (!sublocality) sublocality = component.long_name;
      } else if (types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_3')) {
        if (!locality) locality = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        if (!city) city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // Use the most specific available location (sublocality > locality > city)
    const finalCity = sublocality || locality || city;

    if (finalCity && country) {
      return {
        city: finalCity,
        state: state || '',
        country,
        formatted_address: placeDetails.formatted_address,
        place_id: placeDetails.place_id
      };
    }
    return null;
  };

  const handleConfirm = () => {
    if (selectedRegion) {
      onRegionSelect(selectedRegion.city);
    }
  };

  const handleCancel = () => {
    setSelectedRegion(null);
    setDetectedLocation(null);
    setSearchTerm('');
    setSearchResults([]);
    onCancel();
  };

  const handleUseDetectedLocation = () => {
    if (detectedLocation) {
      setSelectedRegion(detectedLocation);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Your Region
          </DialogTitle>
          <DialogDescription>
            Choose the region you'll be managing. This will filter all data to show only region-specific information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading Google Maps */}
          {!isGoogleLoaded && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading location services...
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto-detect location button */}
          {isGoogleLoaded && !isDetecting && !detectedLocation && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Auto-detect Location</div>
                    <div className="text-sm text-muted-foreground">
                      Let us detect your current location automatically
                    </div>
                  </div>
                  <Button 
                    onClick={detectLocation}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    Detect Location
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detecting location */}
          {isDetecting && isGoogleLoaded && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Detecting your location...
                </div>
              </CardContent>
            </Card>
          )}

          {/* Auto-detected location */}
          {detectedLocation && !isDetecting && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">Detected Location</div>
                    <div className="text-sm text-muted-foreground">
                      {detectedLocation.city}, {detectedLocation.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Auto-detected</Badge>
                    {selectedRegion?.place_id !== detectedLocation.place_id && (
                      <Button size="sm" variant="outline" onClick={handleUseDetectedLocation}>
                        Use This
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Search input */}
          {isGoogleLoaded && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for your city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Search Results</div>
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {searchResults.map((place) => (
                  <Button
                    key={place.place_id}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePlaceSelect(place)}
                    className="w-full justify-start h-auto py-2 px-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{place.structured_formatting.main_text}</div>
                      <div className="text-xs text-muted-foreground">
                        {place.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Selected region display */}
          {selectedRegion && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Selected Region</div>
                    <div className="text-lg font-semibold">{selectedRegion.city}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedRegion.state}, {selectedRegion.country}
                    </div>
                  </div>
                  <Badge variant="default">Selected</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!selectedRegion}
          >
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
