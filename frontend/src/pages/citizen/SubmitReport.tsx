import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, X, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import { Region } from '../../types';
import { PageHeader } from '../../components/common';
import toast from 'react-hot-toast';

const ISSUE_TYPES = [
  { value: 'pothole',              label: '🕳️ Pothole' },
  { value: 'damaged_sign',         label: '⚠️ Damaged Sign' },
  { value: 'broken_traffic_light', label: '🚦 Broken Traffic Light' },
  { value: 'flooded_road',         label: '🌊 Flooded Road' },
  { value: 'cracked_road',         label: '⚡ Cracked Road' },
  { value: 'road_blockage',        label: '🚧 Road Blockage' },
  { value: 'other',                label: '📌 Other' },
];

const SEVERITIES = [
  { value: 'low',      label: 'Low',      desc: 'Minor inconvenience',  color: 'border-blue-500 bg-blue-500/10 text-blue-400' },
  { value: 'medium',   label: 'Medium',   desc: 'Needs attention soon', color: 'border-yellow-500 bg-yellow-500/10 text-yellow-400' },
  { value: 'high',     label: 'High',     desc: 'Dangerous condition',  color: 'border-orange-500 bg-orange-500/10 text-orange-400' },
  { value: 'critical', label: 'Critical', desc: 'Immediate hazard',     color: 'border-red-500 bg-red-500/10 text-red-400' },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number; number: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', issue_type: '', severity: 'medium',
    region_id: '', latitude: '', longitude: '', address: '',
  });

  const { data: regions } = useQuery<Region[]>({
    queryKey: ['regions'],
    queryFn: async () => {
      const { data } = await api.get('/regions');
      return data.data;
    },
  });

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 5));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] },
    maxFiles: 5, maxSize: 10 * 1024 * 1024,
  });

  const removeFile = (idx: number) => setFiles((f) => f.filter((_, i) => i !== idx));

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
          address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        }));
        setGpsLoading(false);
        toast.success('GPS location captured');
      },
      () => { setGpsLoading(false); toast.error('Could not get location'); }
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      files.forEach((f) => fd.append('images', f));

      const { data } = await api.post('/reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmitted({ id: data.data.id, number: data.data.report_number });
      toast.success('Report submitted successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: any) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 text-center animate-in">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="font-display font-bold text-white text-2xl mb-2">Report Submitted!</h2>
        <p className="text-surface-400 mb-1">Your report number is:</p>
        <div className="font-mono text-brand-400 text-xl font-bold mb-6">{submitted.number}</div>
        <p className="text-surface-400 text-sm mb-8 max-w-sm">
          Our team has been notified. You'll receive updates as your report progresses through the system.
        </p>
        <div className="flex gap-3">
          <button onClick={() => navigate(`/dashboard/reports/${submitted.id}`)} className="btn-primary">
            View Report
          </button>
          <button onClick={() => { setSubmitted(null); setStep(1); setForm({ title:'',description:'',issue_type:'',severity:'medium',region_id:'',latitude:'',longitude:'',address:'' }); setFiles([]); }}
            className="btn-secondary">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <PageHeader title="Report a Road Issue" subtitle="Help us fix Namibia's roads — your report matters." />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              s === step ? 'bg-brand-600 text-white' : s < step ? 'bg-emerald-500 text-white' : 'bg-surface-800 text-surface-400'
            }`}>
              {s < step ? '✓' : s}
            </div>
            <span className={`text-sm ${s === step ? 'text-white' : 'text-surface-500'}`}>
              {['Issue Details', 'Location', 'Photos'][s - 1]}
            </span>
            {s < 3 && <div className="flex-1 h-px bg-surface-800 w-8" />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        className="card p-6 space-y-5">

        {step === 1 && (
          <>
            <div>
              <label className="label">Issue Title *</label>
              <input type="text" value={form.title} onChange={set('title')}
                className="input-field" placeholder="e.g. Large pothole on Independence Ave" required />
            </div>

            <div>
              <label className="label">Issue Type *</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, issue_type: value }))}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${
                      form.issue_type === value
                        ? 'border-brand-500 bg-brand-500/10 text-white'
                        : 'border-surface-700 hover:border-surface-600 text-surface-300'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Severity Level *</label>
              <div className="grid grid-cols-2 gap-2">
                {SEVERITIES.map(({ value, label, desc, color }) => (
                  <button key={value} type="button"
                    onClick={() => setForm((f) => ({ ...f, severity: value }))}
                    className={`text-left p-3 rounded-xl border-2 transition-all ${
                      form.severity === value ? color : 'border-surface-700 text-surface-400 hover:border-surface-600'
                    }`}>
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Description *</label>
              <textarea value={form.description} onChange={set('description')} rows={4}
                className="input-field resize-none"
                placeholder="Describe the issue in detail — size, danger level, how long it's been there…" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <label className="label">Region *</label>
              <select value={form.region_id} onChange={set('region_id')} className="select-field">
                <option value="">Select region…</option>
                {regions?.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Street Address</label>
              <input type="text" value={form.address} onChange={set('address')}
                className="input-field" placeholder="e.g. B1 Highway, Windhoek North" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Latitude</label>
                <input type="number" step="any" value={form.latitude} onChange={set('latitude')}
                  className="input-field" placeholder="-22.5597" />
              </div>
              <div>
                <label className="label">Longitude</label>
                <input type="number" step="any" value={form.longitude} onChange={set('longitude')}
                  className="input-field" placeholder="17.0832" />
              </div>
            </div>

            <button type="button" onClick={getGPS} disabled={gpsLoading}
              className="btn-secondary w-full justify-center">
              <MapPin className="w-4 h-4" />
              {gpsLoading ? 'Getting location…' : 'Use My Current GPS Location'}
            </button>

            {form.latitude && form.longitude && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-emerald-400 text-sm">
                <CheckCircle className="w-4 h-4 shrink-0" />
                GPS coordinates captured: {form.latitude}, {form.longitude}
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-brand-500 bg-brand-500/10' : 'border-surface-700 hover:border-surface-600'
              }`}>
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-surface-400 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">
                {isDragActive ? 'Drop images here' : 'Upload Photos'}
              </p>
              <p className="text-surface-400 text-sm">Drag & drop or click · Max 5 images · 10MB each</p>
            </div>

            {files.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative group">
                    <img src={URL.createObjectURL(file)} alt={file.name}
                      className="w-full aspect-square object-cover rounded-xl" />
                    <button onClick={() => removeFile(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 rounded-b-xl px-2 py-1">
                      <p className="text-xs text-white truncate">{file.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="bg-surface-800/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="font-medium text-white mb-2">Report Summary</div>
              <div className="flex justify-between"><span className="text-surface-400">Title</span><span className="text-white truncate max-w-xs">{form.title || '—'}</span></div>
              <div className="flex justify-between"><span className="text-surface-400">Type</span><span className="text-white">{form.issue_type || '—'}</span></div>
              <div className="flex justify-between"><span className="text-surface-400">Severity</span><span className="text-white capitalize">{form.severity}</span></div>
              <div className="flex justify-between"><span className="text-surface-400">Photos</span><span className="text-white">{files.length} attached</span></div>
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="btn-secondary">← Back</button>
          ) : <div />}

          {step < 3 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={step === 1 && (!form.title || !form.issue_type || !form.description)}
              className="btn-primary disabled:opacity-50">Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading || !form.region_id} className="btn-primary disabled:opacity-50">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </span>
              ) : 'Submit Report'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
