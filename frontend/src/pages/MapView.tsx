import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Filter, Layers, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { PageHeader, SeverityBadge, StatusBadge } from '../components/common';
import { formatDate, issueTypeConfig, severityConfig } from '../utils/helpers';
import { Link } from 'react-router-dom';

// Leaflet dynamic import to avoid SSR issues
let L: any;

const severityMapColors: Record<string, string> = {
  low: '#3b82f6', medium: '#eab308', high: '#f97316', critical: '#ef4444'
};

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filters, setFilters] = useState({ severity: '', status: '', region_id: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const { data: mapData, refetch, isFetching } = useQuery({
    queryKey: ['map-data', filters],
    queryFn: async () => {
      const params = new URLSearchParams(
        Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
      );
      const { data } = await api.get(`/reports/map?${params}`);
      return data.data;
    },
  });

  const { data: regions } = useQuery({
    queryKey: ['regions'],
    queryFn: async () => { const { data } = await api.get('/regions'); return data.data; },
  });

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const initMap = async () => {
      L = await import('leaflet');

      leafletMap.current = L.map(mapRef.current, {
        center: [-22.5597, 17.0832], // Windhoek, Namibia
        zoom: 6,
        zoomControl: false,
      });

      // Dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(leafletMap.current);

      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);

      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
      setMapReady(true);
    };

    initMap();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Add markers when data changes
  useEffect(() => {
    if (!mapReady || !markersLayer.current || !L) return;

    markersLayer.current.clearLayers();

    (mapData || []).forEach((report: any) => {
      if (!report.latitude || !report.longitude) return;

      const color = severityMapColors[report.severity] || '#6b7280';
      const icon = issueTypeConfig[report.issue_type as keyof typeof issueTypeConfig]?.icon || '📌';

      const markerHtml = `
        <div style="
          width: 36px; height: 36px;
          background: ${color}20;
          border: 2px solid ${color};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; cursor: pointer;
          box-shadow: 0 0 0 4px ${color}15;
          transition: all 0.2s;
        ">${icon}</div>
      `;

      const marker = L.marker([report.latitude, report.longitude], {
        icon: L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        }),
      });

      marker.on('click', () => setSelectedReport(report));

      const popupContent = `
        <div style="min-width: 200px; font-family: 'DM Sans', sans-serif;">
          <div style="font-weight: 700; color: #f1f5f9; margin-bottom: 4px; font-size: 14px;">${report.title}</div>
          <div style="color: #94a3b8; font-size: 12px; margin-bottom: 8px;">${report.report_number}</div>
          <div style="display:flex; gap:6px; flex-wrap: wrap;">
            <span style="background:${color}20; color:${color}; padding: 2px 8px; border-radius: 999px; font-size: 11px; border: 1px solid ${color}40;">${report.severity}</span>
            <span style="background:#1e293b; color:#94a3b8; padding: 2px 8px; border-radius: 999px; font-size: 11px; border: 1px solid #334155;">${report.status.replace(/_/g,' ')}</span>
          </div>
          ${report.address ? `<div style="color:#64748b; font-size:11px; margin-top:6px;">📍 ${report.address}</div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 260,
        closeButton: true,
      });

      markersLayer.current.addLayer(marker);
    });
  }, [mapData, mapReady]);

  const severities = ['low','medium','high','critical'];
  const statuses = ['reported','under_review','verified','assigned','in_progress','completed'];

  return (
    <div className="space-y-4 animate-in h-full flex flex-col">
      <div className="flex items-center justify-between">
        <PageHeader title="Live Map" subtitle={`${mapData?.length || 0} locations shown`} />
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} disabled={isFetching}
            className="btn-secondary text-sm p-2">
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary text-sm flex items-center gap-2 ${showFilters ? 'border-brand-500 text-brand-400' : ''}`}>
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="card p-4 flex flex-wrap gap-3">
          <select value={filters.severity} onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value }))}
            className="select-field w-auto py-2 text-sm">
            <option value="">All Severities</option>
            {severities.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
            className="select-field w-auto py-2 text-sm">
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filters.region_id} onChange={(e) => setFilters(f => ({ ...f, region_id: e.target.value }))}
            className="select-field w-auto py-2 text-sm">
            <option value="">All Regions</option>
            {(regions || []).map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={() => setFilters({ severity: '', status: '', region_id: '' })}
            className="btn-secondary text-sm py-2">Clear</button>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3">
        {Object.entries(severityMapColors).map(([sev, color]) => (
          <div key={sev} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, background: color + '30' }} />
            <span className="text-surface-400 text-xs capitalize">{sev}</span>
          </div>
        ))}
      </div>

      {/* Map container + detail panel */}
      <div className="flex gap-4 flex-1" style={{ minHeight: '500px' }}>
        {/* Map */}
        <div ref={mapRef} className="flex-1 rounded-2xl overflow-hidden border border-surface-800" style={{ minHeight: '500px' }} />

        {/* Selected report detail */}
        {selectedReport && (
          <div className="w-80 card p-5 space-y-4 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-white text-sm">{selectedReport.title}</h3>
                <p className="text-surface-500 text-xs font-mono mt-0.5">{selectedReport.report_number}</p>
              </div>
              <button onClick={() => setSelectedReport(null)}
                className="text-surface-500 hover:text-white p-1">✕</button>
            </div>

            <div className="flex flex-wrap gap-2">
              <SeverityBadge severity={selectedReport.severity} />
              <StatusBadge status={selectedReport.status} />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-surface-500 text-xs w-16 shrink-0">Type</span>
                <span className="text-surface-300 text-xs">{issueTypeConfig[selectedReport.issue_type as keyof typeof issueTypeConfig]?.label}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-surface-500 text-xs w-16 shrink-0">Region</span>
                <span className="text-surface-300 text-xs">{selectedReport.region_name}</span>
              </div>
              {selectedReport.address && (
                <div className="flex items-start gap-2">
                  <span className="text-surface-500 text-xs w-16 shrink-0">Address</span>
                  <span className="text-surface-300 text-xs">{selectedReport.address}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-surface-500 text-xs w-16 shrink-0">Date</span>
                <span className="text-surface-300 text-xs">{formatDate(selectedReport.created_at)}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-surface-500 text-xs w-16 shrink-0">GPS</span>
                <span className="text-surface-300 text-xs font-mono">{selectedReport.latitude}, {selectedReport.longitude}</span>
              </div>
            </div>

            <Link to={`/dashboard/reports/${selectedReport.id}`} className="btn-primary w-full justify-center text-sm py-2">
              View Full Report
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
