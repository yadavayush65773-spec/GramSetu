import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LOCATIONS } from '../data/seedData';
import { formatINR } from '../utils/formatters';
import { 
  Map, 
  Layers, 
  Filter, 
  MapPin, 
  ShieldAlert, 
  UserCheck, 
  ClipboardCheck, 
  Eye, 
  X,
  List,
  Compass,
  Info
} from 'lucide-react';
import L from 'leaflet';

export const GeographicIntelligence: React.FC = () => {
  const { 
    beneficiaries, 
    inspections, 
    riskCases, 
    selectedDistrict, 
    setSelectedDistrict, 
    language,
    setActiveEvidenceModal 
  } = useApp();

  const [layerBeneficiaries, setLayerBeneficiaries] = useState(true);
  const [layerInspections, setLayerInspections] = useState(true);
  const [layerRisks, setLayerRisks] = useState(true);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const isHi = language === 'hi';

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [25.3176, 82.9739], // Centered around Varanasi / Purvanchal region
        zoom: 9,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive or clean up
    };
  }, []);

  // Update map markers when filters or layers toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    // 1. Beneficiaries
    if (layerBeneficiaries) {
      beneficiaries.forEach((b) => {
        if (selectedDistrict !== 'All' && b.district !== selectedDistrict) return;

        const isVerified = b.verificationStatus === 'Verified';
        const isFlagged = b.verificationStatus === 'Flagged';
        const color = isVerified ? '#23865B' : isFlagged ? '#C64242' : '#E99A36';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              B
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([b.coordinates.lat, b.coordinates.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <strong style="color: #0D3B2E; font-size: 13px;">${b.fullName}</strong>
            <p style="margin: 2px 0; color: #66756F;">${b.village}, ${b.district}</p>
            <p style="margin: 2px 0; font-weight: 600;">${b.schemeName}</p>
            <div style="margin-top: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color}; font-weight: bold;">
                ${b.verificationStatus}
              </span>
              <span style="font-size: 11px; font-weight: bold; color: #0D3B2E;">Risk: ${b.riskScore}/100</span>
            </div>
          </div>
        `);
        marker.on('click', () => {
          setSelectedPin({ type: 'beneficiary', data: b });
        });
        markersGroup.addLayer(marker);
      });
    }

    // 2. Field Inspections
    if (layerInspections) {
      inspections.forEach((insp) => {
        if (selectedDistrict !== 'All' && insp.district !== selectedDistrict) return;

        const isPassed = insp.status === 'Passed';
        const isFailed = insp.status === 'Failed';
        const color = isPassed ? '#174C3C' : isFailed ? '#991B1B' : '#D99220';

        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 8px; border: 2.5px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">
              ✓
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([insp.gpsLocation.lat, insp.gpsLocation.lng], { icon: customIcon });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 4px;">
            <strong style="color: #0D3B2E; font-size: 13px;">${insp.inspectionCode}</strong>
            <p style="margin: 2px 0; color: #66756F;">Inspector: ${insp.inspectorName}</p>
            <p style="margin: 2px 0;">Stage: <strong>${insp.stage}</strong></p>
            <div style="margin-top: 6px;">
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: ${color}20; color: ${color}; font-weight: bold;">
                Status: ${insp.status}
              </span>
            </div>
          </div>
        `);
        marker.on('click', () => {
          setSelectedPin({ type: 'inspection', data: insp });
        });
        markersGroup.addLayer(marker);
      });
    }

    // Adjust bounds if district changed
    if (selectedDistrict === 'Varanasi') {
      map.setView([25.3176, 82.9739], 11);
    } else if (selectedDistrict === 'Prayagraj') {
      map.setView([25.4358, 81.8463], 11);
    } else if (selectedDistrict === 'Gorakhpur') {
      map.setView([26.7606, 83.3732], 11);
    } else if (selectedDistrict === 'Mirzapur') {
      map.setView([25.1337, 82.5644], 11);
    } else {
      map.setView([25.6, 82.6], 9);
    }
  }, [layerBeneficiaries, layerInspections, layerRisks, selectedDistrict, beneficiaries, inspections]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'भौगोलिक मानचित्र व स्थानिक विश्लेषिकी' : 'Geographic Intelligence & Spatial Coverage'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'ओपनस्ट्रीटमैप आधारित ग्राम-स्तरीय क्रियान्वयन कवरेज, निरीक्षण केंद्र व हॉटस्पॉट' : 'Interactive village-level project implementation, verified GPS markers & risk alerts'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer Controls */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-[#174C3C]" />
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={layerBeneficiaries}
                onChange={(e) => setLayerBeneficiaries(e.target.checked)}
                className="rounded accent-[#174C3C]"
              />
              <span>Beneficiaries</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={layerInspections}
                onChange={(e) => setLayerInspections(e.target.checked)}
                className="rounded accent-[#174C3C]"
              />
              <span>Inspections</span>
            </label>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${viewMode === 'map' ? 'bg-[#174C3C] text-white' : 'text-gray-600'}`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${viewMode === 'list' ? 'bg-[#174C3C] text-white' : 'text-gray-600'}`}
            >
              <List className="w-3.5 h-3.5" />
              <span>List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      {viewMode === 'map' && (
        <div className="relative bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden h-[580px] flex flex-col">
          {/* Leaflet container */}
          <div ref={mapContainerRef} className="flex-1 w-full h-full" />

          {/* Floating Map Legend Card */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-gray-200 text-xs space-y-1.5 max-w-xs">
            <p className="font-bold text-[#0D3B2E] text-[11px] uppercase tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#E99A36]" /> Spatial Map Legend
            </p>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-[#23865B] border border-white" />
              <span>Verified Beneficiary Site</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded-full bg-[#C64242] border border-white" />
              <span>Flagged Geo-fence Anomaly</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-3 h-3 rounded-md bg-[#174C3C] border border-white" />
              <span>Completed Field Inspection</span>
            </div>
          </div>

          {/* Selected Pin Drawer */}
          {selectedPin && (
            <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 text-xs w-72 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
                <span className="font-bold uppercase text-[10px] text-[#789B82]">
                  {selectedPin.type === 'beneficiary' ? 'Beneficiary Site Pin' : 'Field Inspection Pin'}
                </span>
                <button onClick={() => setSelectedPin(null)} className="text-gray-400 hover:text-gray-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedPin.type === 'beneficiary' ? (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#0D3B2E] text-sm">{selectedPin.data.fullName}</h4>
                  <p className="text-[#66756F]">{selectedPin.data.village}, {selectedPin.data.district}</p>
                  <p className="font-medium text-[#192D3A]">{selectedPin.data.schemeName}</p>
                  <div className="pt-2 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#23865B]">{selectedPin.data.verificationStatus}</span>
                    <span className="font-mono text-xs">Risk: {selectedPin.data.riskScore}/100</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-[#0D3B2E] text-sm">{selectedPin.data.inspectionCode}</h4>
                  <p className="text-[#66756F]">For: {selectedPin.data.beneficiaryName}</p>
                  <p className="font-medium">{selectedPin.data.stage} Stage</p>
                  <div className="pt-2 flex justify-between items-center text-[11px]">
                    <span className="font-bold text-[#174C3C]">{selectedPin.data.status}</span>
                    <span className="font-mono text-xs">{selectedPin.data.completedDate}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* List Viewport */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LOCATIONS.map((loc) => {
            const villageBeneficiaries = beneficiaries.filter((b) => b.village === loc.villageName);
            const verifiedCount = villageBeneficiaries.filter((b) => b.verificationStatus === 'Verified').length;

            return (
              <div key={loc.villageId} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-[#0D3B2E]">{isHi ? loc.villageNameHi : loc.villageName}</h3>
                    <p className="text-[11px] text-[#66756F]">{loc.blockName}, {loc.districtName}</p>
                  </div>
                  <span className="text-[10px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                    {loc.lat.toFixed(3)}°N, {loc.lng.toFixed(3)}°E
                  </span>
                </div>
                <div className="p-2.5 bg-[#F7F6F0] rounded-xl text-xs flex justify-between">
                  <span>Enrolled: <strong>{villageBeneficiaries.length}</strong></span>
                  <span className="text-[#23865B]">Verified: <strong>{verifiedCount}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
