'use client';

import { useEffect, useRef } from 'react';

interface Stop {
  type: string;
  locationName?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  earlyArrival: string;
  lateArrival: string;
}

interface MapViewProps {
  stops: Stop[];
  onClose: () => void;
}

export default function MapView({ stops, onClose }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!mapRef.current || stops.length < 2) return;
    
    // Prevent multiple initializations
    if (isInitializedRef.current || mapInstanceRef.current) return;
    
    // Check if container already has a Leaflet map instance
    if ((mapRef.current as any)._leaflet_id) {
      return;
    }

    // Use OpenStreetMap with Leaflet (completely free)
    const loadMapScript = () => {
      // Check if Leaflet is already loaded
      if ((window as any).L) {
        initializeMap();
        return;
      }

      // Check if CSS is already loaded
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Check if script is already loaded
      if (!document.querySelector('script[src*="leaflet.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
        script.crossOrigin = '';
        script.onload = initializeMap;
        document.body.appendChild(script);
      } else {
        // Script already exists, wait a bit and try to initialize
        setTimeout(() => {
          if ((window as any).L) {
            initializeMap();
          }
        }, 100);
      }
    };

    const initializeMap = async () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;
      
      // Prevent multiple initializations
      if (isInitializedRef.current || mapInstanceRef.current) return;

      // Check if container already has a map
      if ((mapRef.current as any)._leaflet_id) {
        return;
      }

      // Mark as initialized immediately to prevent race conditions
      isInitializedRef.current = true;

      // Initialize map
      const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      // Geocode addresses and add markers
      const geocodeAddress = async (address: string, city: string, state: string, zipCode: string) => {
        try {
          // Use Nominatim (OpenStreetMap's geocoding service - free)
          const query = `${address}, ${city}, ${state} ${zipCode}`;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            {
              headers: {
                'User-Agent': 'TMS Application'
              }
            }
          );
          const data = await response.json();
          
          if (data && data.length > 0) {
            return {
              lat: parseFloat(data[0].lat),
              lon: parseFloat(data[0].lon)
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
        return null;
      };

      // Process all stops
      const markers: any[] = [];
      const bounds: any[] = [];

      for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const coords = await geocodeAddress(stop.address, stop.city, stop.state, stop.zipCode);
        
        if (coords) {
          const isPickup = stop.type === 'pickup';
          const isDelivery = stop.type === 'delivery';
          const color = isPickup ? 'green' : isDelivery ? 'red' : 'blue';
          const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });

          // Format dates
          const formatDate = (dateString: string) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          };

          const earlyDate = stop.earlyArrival ? formatDate(stop.earlyArrival) : 'N/A';
          const lateDate = stop.lateArrival ? formatDate(stop.lateArrival) : 'N/A';

          // Create popup content with origin/destination details
          let popupContent = `
            <div style="min-width: 200px;">
              <strong style="font-size: 14px; color: ${color === 'green' ? '#16a34a' : color === 'red' ? '#dc2626' : '#2563eb'};">
                ${stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
              </strong><br/>
              ${stop.locationName ? `<strong>${stop.locationName}</strong><br/>` : ''}
              ${stop.address}<br/>
              ${stop.city}, ${stop.state} ${stop.zipCode}<br/>
              <hr style="margin: 8px 0; border: none; border-top: 1px solid #e5e7eb;"/>
              <div style="font-size: 12px; color: #6b7280;">
                <strong>Arrival Window:</strong><br/>
                Early: ${earlyDate}<br/>
                Late: ${lateDate}
              </div>
            </div>
          `;

          const marker = L.marker([coords.lat, coords.lon], { icon })
            .addTo(map)
            .bindPopup(popupContent);
          
          markers.push(marker);
          bounds.push([coords.lat, coords.lon]);
        }
      }

      // Draw route line from origin to destination with waypoints
      let routeLine: any = null;
      if (bounds.length > 1) {
        // Create route coordinates: origin -> intermediate stops -> destination
        const routeCoordinates: any[] = [];
        
        // Add origin (first stop)
        if (bounds[0]) routeCoordinates.push(bounds[0]);
        
        // Add intermediate stops (if any)
        for (let i = 1; i < bounds.length - 1; i++) {
          routeCoordinates.push(bounds[i]);
        }
        
        // Add destination (last stop)
        if (bounds.length > 1) {
          routeCoordinates.push(bounds[bounds.length - 1]);
        }
        
        // Draw the route polyline with a more visible style
        routeLine = L.polyline(routeCoordinates, {
          color: '#2563eb',
          weight: 5,
          opacity: 0.9,
          smoothFactor: 1
        }).addTo(map);
        
        // Add a shadow/outline for better visibility
        L.polyline(routeCoordinates, {
          color: '#1e40af',
          weight: 7,
          opacity: 0.3,
          smoothFactor: 1
        }).addTo(map).bringToBack();
        
        // Add direction arrows along the route
        const arrowIcon = L.divIcon({
          className: 'route-arrow',
          html: '<div style="font-size: 24px; color: #2563eb; font-weight: bold; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">→</div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        
        // Add direction arrows at intervals along the route
        if (routeCoordinates.length > 1) {
          const numArrows = Math.min(3, routeCoordinates.length - 1);
          for (let i = 1; i <= numArrows; i++) {
            const arrowIndex = Math.floor((routeCoordinates.length - 1) * (i / (numArrows + 1)));
            if (arrowIndex > 0 && arrowIndex < routeCoordinates.length) {
              const arrowPoint = routeCoordinates[arrowIndex];
              L.marker(arrowPoint, { icon: arrowIcon, interactive: false, zIndexOffset: 1000 }).addTo(map);
            }
          }
        }
      }

      // Fit map to show all markers
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }

      // Add origin and destination info box
      if (stops.length >= 2) {
        const origin = stops[0];
        const destination = stops[stops.length - 1];
        
        const formatDateForInfo = (dateString: string) => {
          const date = new Date(dateString);
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        };

        const originEarly = origin.earlyArrival ? formatDateForInfo(origin.earlyArrival) : 'N/A';
        const originLate = origin.lateArrival ? formatDateForInfo(origin.lateArrival) : 'N/A';
        const destEarly = destination.earlyArrival ? formatDateForInfo(destination.earlyArrival) : 'N/A';
        const destLate = destination.lateArrival ? formatDateForInfo(destination.lateArrival) : 'N/A';

        const infoHtml = `
          <div style="background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); min-width: 250px; max-width: 300px;">
            <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #16a34a;">
              <div style="font-weight: bold; color: #16a34a; margin-bottom: 4px; font-size: 12px;">ORIGIN (Pickup)</div>
              <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${origin.locationName || 'Pickup Location'}</div>
              <div style="font-size: 12px; color: #6b7280;">${origin.address}</div>
              <div style="font-size: 12px; color: #6b7280;">${origin.city}, ${origin.state} ${origin.zipCode}</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                <strong>Arrival Window:</strong><br/>
                ${originEarly} - ${originLate}
              </div>
            </div>
            <div>
              <div style="font-weight: bold; color: #dc2626; margin-bottom: 4px; font-size: 12px;">DESTINATION (Delivery)</div>
              <div style="font-size: 13px; font-weight: 600; margin-bottom: 2px;">${destination.locationName || 'Delivery Location'}</div>
              <div style="font-size: 12px; color: #6b7280;">${destination.address}</div>
              <div style="font-size: 12px; color: #6b7280;">${destination.city}, ${destination.state} ${destination.zipCode}</div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                <strong>Arrival Window:</strong><br/>
                ${destEarly} - ${destLate}
              </div>
            </div>
          </div>
        `;

        // Add info box to map as a custom control
        const InfoControl = L.Control.extend({
          onAdd: function() {
            const div = L.DomUtil.create('div', 'route-info-control');
            div.innerHTML = infoHtml;
            div.style.cssText = 'background: transparent; border: none;';
            return div;
          }
        });
        
        new InfoControl({ position: 'topright' }).addTo(map);
      }
    };

    loadMapScript();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Map might already be removed
          console.log('Map cleanup:', e);
        }
        mapInstanceRef.current = null;
        isInitializedRef.current = false;
        
        // Clear the container's leaflet ID
        if (mapRef.current) {
          (mapRef.current as any)._leaflet_id = undefined;
        }
      }
    };
  }, [stops]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Route Map</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>
        <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: 0 }} />
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
              <span className="text-gray-700">Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white"></div>
              <span className="text-gray-700">Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
              <span className="text-gray-700">Intermediate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

