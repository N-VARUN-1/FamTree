import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';
import L from 'leaflet';

export default function FamilyMap({ members }) {
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            const results = await Promise.all(
                members.map(async (m) => {
                    if (!m.data?.location) return null;

                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(m.data.location)}`
                    );
                    const data = await res.json();

                    if (data.length > 0) {
                        return {
                            name: m.data.label,
                            relation: m.data.relation,
                            coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)],
                        };
                    }
                    return null;
                })

            );

            setLocations(results.filter(Boolean));
        };

        fetchCoordinates();
    }, [members]);

    return (
        <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
            <TileLayer
                attribution="© OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, idx) => (
                <Marker key={idx} position={loc.coords}>
                    <Popup>
                        <strong>{loc.name}</strong><br />
                        {loc.relation}
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};
