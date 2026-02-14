'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
    waypoints: Array<{ latitude: number; longitude: number }>;
    currentPosition: { latitude: number; longitude: number };
    origin: { latitude: number; longitude: number; address: string };
    destination: { latitude: number; longitude: number; address: string };
}

export default function MapComponent({ waypoints, currentPosition, origin, destination }: MapComponentProps) {
    useEffect(() => {
        // Initialize map
        const map = L.map('map').setView([currentPosition.latitude, currentPosition.longitude], 13);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(map);

        // Custom truck icon
        const truckIcon = L.divIcon({
            html: `<div style="background: linear-gradient(135deg, #10b981, #059669); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-center; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
        <svg style="width: 20px; height: 20px; color: white;" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
        </svg>
      </div>`,
            className: '',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        // Add truck marker
        const truckMarker = L.marker([currentPosition.latitude, currentPosition.longitude], {
            icon: truckIcon,
        }).addTo(map);

        // Add origin marker
        L.marker([origin.latitude, origin.longitude])
            .addTo(map)
            .bindPopup(`<b>Origin</b><br/>${origin.address}`);

        // Add destination marker
        L.marker([destination.latitude, destination.longitude])
            .addTo(map)
            .bindPopup(`<b>Destination</b><br/>${destination.address}`);

        // Draw route polyline
        const routeCoords: [number, number][] = waypoints.map(wp => [wp.latitude, wp.longitude]);

        L.polyline(routeCoords, {
            color: '#10b981',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
        }).addTo(map);

        // Fit bounds to show entire route
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [50, 50] });

        // Cleanup
        return () => {
            map.remove();
        };
    }, [waypoints, currentPosition, origin, destination]);

    return <div id="map" style={{ width: '100%', height: '100%' }} />;
}
