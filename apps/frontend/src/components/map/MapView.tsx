'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/store/useStore';
import { api } from '@/lib/api';
import { ChevronDown } from 'lucide-react';

// Zone colors from Permen ATR BPN 11/2023
const zoneColors: Record<string, { color: string; label: string }> = {
  'P': { color: '#FFBE00', label: 'Perumahan' },
  'C': { color: '#F05500', label: 'Campuran/Komersial' },
  'I': { color: '#690000', label: 'Industri' },
  'HL': { color: '#325F28', label: 'Hutan Lindung' },
  'H': { color: '#416900', label: 'RTH/Hijau' },
  'BJ': { color: '#EB1E1E', label: 'Badan Jalan' },
  'BA': { color: '#97DBF2', label: 'Badan Air' },
  'S': { color: '#7D197D', label: 'Sosial/Pelayanan' },
  'W': { color: '#FFA5FF', label: 'Pariwisata' },
  'T': { color: '#D73700', label: 'Transportasi' },
  'SP': { color: '#00BCD4', label: 'Sempadan Pantai' },
  'SD': { color: '#8D6E63', label: 'Sempadan Sungai' },
  'ST': { color: '#607D8B', label: 'Sempadan Talud' },
  'SL': { color: '#A1887F', label: 'Sempadan Jalan Kereta Api' },
};

// All available zones
const allZones = Object.entries(zoneColors).map(([code, { color, label }]) => ({
  code,
  color,
  label,
}));

export default function MapView() {
  const {
    view,
    selectedRDTR,
    visibleZones = [],
    zoneFilterExpanded = true,
    setView,
    setSelectedRDTR,
    setSelectedFeature,
    setSelectedCoords,
    setVisibleZones,
    setZoneFilterExpanded,
  } = useStore();

  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const geoJsonLayerRef = useRef<any>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);
  const [featureCount, setFeatureCount] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<any>(null);
  const [availableZones, setAvailableZones] = useState<typeof allZones>(allZones);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset available zones when RDTR changes
  useEffect(() => {
    if (selectedRDTR) {
      setAvailableZones(allZones);
      setVisibleZones([]);
    }
  }, [selectedRDTR]);

  // Toggle zone visibility
  const toggleZone = (zone: string) => {
    if (visibleZones.includes(zone)) {
      setVisibleZones(visibleZones.filter((z) => z !== zone));
    } else {
      setVisibleZones([...visibleZones, zone]);
    }
  };

  // Check all zones
  const checkAllZones = () => {
    setVisibleZones(availableZones.map((z) => z.code));
  };

  // Uncheck all zones
  const uncheckAllZones = () => {
    setVisibleZones([]);
  };

  // Initialize map
  useEffect(() => {
    if (!isClient || view !== 'map' || !mapContainerRef.current || mapRef.current) return;

    const leaflet = require('leaflet');

    // Fix default icon issues
    delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
    leaflet.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Initialize map
    const map = leaflet.map(mapContainerRef.current, {
      center: [-0.5, 114.5],
      zoom: 8,
      zoomControl: true,
    });

    // Add tile layer
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Force map to recalculate size after rendering
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current = null;
      }
    };
  }, [isClient, view]);

  // Update layer styles when visibleZones changes
  useEffect(() => {
    if (!geoJsonLayerRef.current) return;

    geoJsonLayerRef.current.eachLayer((layer: any) => {
      const props = layer.feature?.properties;
      if (props) {
        const zone = props.KODZON || 'default';
        const isVisible = visibleZones.length === 0 || visibleZones.includes(zone);
        const zoneColor = zoneColors[zone]?.color || '#BDBDBD';

        layer.setStyle({
          color: zoneColor,
          weight: 2,
          opacity: isVisible ? 1 : 0,
          fillOpacity: isVisible ? 0.3 : 0,
        });
      }
    });
  }, [visibleZones]);

  // Load GeoJSON data when selectedRDTR changes
  useEffect(() => {
    if (!mapRef.current || !selectedRDTR) return;

    const loadGeoJSON = async () => {
      setLoading(true);
      try {
        const data = await api.getGeoJSON(selectedRDTR.id);
        if (!mapRef.current || !data?.features) return;

        const leaflet = require('leaflet');

        // Extract unique zones from the loaded features
        const uniqueZones = new Set<string>();
        data.features.forEach((feature: any) => {
          const zone = feature.properties?.KODZON;
          if (zone && zone !== 'default') {
            uniqueZones.add(zone);
          }
        });

        // Update available zones - only include zones that exist in the data
        const zonesInData = allZones.filter(z => uniqueZones.has(z.code));
        setAvailableZones(zonesInData);
        setVisibleZones([]); // Reset zone filter when new data loads

        // Remove existing layer
        if (geoJsonLayerRef.current) {
          mapRef.current.removeLayer(geoJsonLayerRef.current);
        }

        // Create new GeoJSON layer
        const geoJsonLayer = leaflet.geoJSON(data.features as any, {
          style: (feature: any) => {
            const props = feature?.properties;
            const zone = props?.KODZON || 'default';
            const isVisible = visibleZones.length === 0 || visibleZones.includes(zone);
            return {
              color: zoneColors[zone]?.color || '#BDBDBD',
              weight: 2,
              opacity: isVisible ? 1 : 0,
              fillOpacity: isVisible ? 0.3 : 0,
            };
          },
          onEachFeature: (feature: any, layer: any) => {
            const props = feature.properties as any;

            // Mouse hover - show tooltip
            layer.on('mouseover', (e: any) => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
              }
              setHoveredFeature({
                props,
                lat: e.latlng.lat,
                lng: e.latlng.lng,
              });
            });

            layer.on('mouseout', () => {
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
              }
              hoverTimeoutRef.current = setTimeout(() => {
                setHoveredFeature(null);
              }, 200);
            });

            // Click - select feature
            layer.on('click', (e: any) => {
              setSelectedFeature(props);
              setSelectedCoords({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
              });
            });
          },
        }).addTo(mapRef.current);

        geoJsonLayerRef.current = geoJsonLayer;
        setFeatureCount(data.returned || data.features.length);

        // Fit map to feature bounds
        if (data.features.length > 0) {
          const bounds = geoJsonLayer.getBounds();
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, [selectedRDTR]);

  if (!isClient) return <div className="flex h-full items-center justify-center">Loading map...</div>;

  return (
    <div className="map-view" style={{ display: view === 'map' ? 'flex' : 'none' }}>
      <div id="map" ref={mapContainerRef} style={{ width: '100%', height: '100%' }}></div>

      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => {
          setView('grid');
          setSelectedRDTR(null);
          setSelectedFeature(null);
          setSelectedCoords(null);
        }}
      >
        <i className="fas fa-arrow-left"></i>
        <span>Kembali ke Daftar RDTR</span>
      </button>

      {/* Current RDTR Info */}
      <div className="current-rdtr-info">
        <div className="current-rdtr-name">{selectedRDTR?.name || '-'}</div>
        {loading && <span className="text-xs text-gray-500">Loading...</span>}
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-card">
            <i className="fas fa-spinner fa-spin text-blue-500 text-2xl"></i>
            <span className="loading-text">Memuat data peta...</span>
            {featureCount > 0 && (
              <span className="loading-count">{featureCount.toLocaleString('id-ID')} polygon</span>
            )}
          </div>
        </div>
      )}

      {/* Polygon Tooltip */}
      {hoveredFeature && (
        <div className="polygon-tooltip">
          <div className="tooltip-title">{hoveredFeature.props.NAMSZN || hoveredFeature.props.NAMZON || 'Unknown'}</div>
          <div className="tooltip-row">
            <span className="tooltip-label">Zona:</span>
            <span className="tooltip-value">{hoveredFeature.props.KODZON || '-'}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Sub Zona:</span>
            <span className="tooltip-value">{hoveredFeature.props.KODSZN || '-'}</span>
          </div>
          <div className="tooltip-row">
            <span className="tooltip-label">Kecamatan:</span>
            <span className="tooltip-value">{hoveredFeature.props.WADMKC || '-'}</span>
          </div>
          <div className="tooltip-coords">
            <i className="fas fa-map-pin"></i>
            <span>
              {hoveredFeature.lat?.toFixed(5)}, {hoveredFeature.lng?.toFixed(5)}
            </span>
          </div>
        </div>
      )}

      {/* Zone Filter Panel */}
      <div className="zone-filter-panel">
        <div className="zone-filter-header">
          <h4>
            <i className="fas fa-layer-group"></i> Zona
            <span className="zone-count-badge">{availableZones.length}</span>
          </h4>
          <button
            className={`zone-filter-toggle ${zoneFilterExpanded ? '' : 'collapsed'}`}
            onClick={() => setZoneFilterExpanded(!zoneFilterExpanded)}
            title="Toggle Filter"
          >
            <ChevronDown className="h-3 w-3" />
          </button>
        </div>
        <div className={`zone-filter-content ${zoneFilterExpanded ? '' : 'collapsed'}`}>
          <div className="zone-filter-actions">
            <button className="zone-filter-btn" onClick={checkAllZones}>
              <i className="fas fa-check-double"></i> Semua
            </button>
            <button className="zone-filter-btn" onClick={uncheckAllZones}>
              <i className="fas fa-times"></i> Bersihkan
            </button>
          </div>
          <div className="zone-filter-list">
            {availableZones.length > 0 ? (
              availableZones.map((zone) => (
                <label
                  key={zone.code}
                  className={`zone-filter-item ${visibleZones.includes(zone.code) ? 'checked' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={visibleZones.includes(zone.code)}
                    onChange={() => toggleZone(zone.code)}
                  />
                  <div className="zone-filter-color" style={{ backgroundColor: zone.color }}></div>
                  <span className="zone-filter-label">
                    {zone.code} - {zone.label}
                  </span>
                </label>
              ))
            ) : (
              <div className="zone-filter-empty">Tidak ada zona tersedia</div>
            )}
          </div>
        </div>
      </div>

      {/* Legend Panel */}
      <div className="legend-panel">
        <h4>
          <i className="fas fa-palette"></i> Legenda
        </h4>
        <div className="legend-grid" id="legendGrid">
          {availableZones.map((zone) => (
            <div key={zone.code} className="legend-item">
              <div className="legend-color" style={{ backgroundColor: zone.color }}></div>
              <span>
                {zone.code} - {zone.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
