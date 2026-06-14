import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight, MapPin, CheckCircle, BarChart3, Shield, Zap,
  Globe, ArrowRight, HardHat, AlertTriangle, Construction,
} from 'lucide-react';

// ── Animation presets ─────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

// ── RFA Logo mark (SVG inline) ───────────────────────────
function RFAMark({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="44" height="44" rx="10" fill="#1a7a4a"/>
      <rect x="21" y="6"  width="2.5" height="6"  rx="1.25" fill="#C9A227"/>
      <rect x="21" y="18" width="2.5" height="8"  rx="1.25" fill="#C9A227"/>
      <rect x="21" y="32" width="2.5" height="6"  rx="1.25" fill="#C9A227"/>
      <rect x="10" y="6"  width="2"   height="32" rx="1"    fill="rgba(255,255,255,0.22)"/>
      <rect x="32" y="6"  width="2"   height="32" rx="1"    fill="rgba(255,255,255,0.22)"/>
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────
const stats = [
  { label: 'Reports Processed',       value: '12,847', icon: BarChart3,    color: '#4ab47e' },
  { label: 'Roads Repaired',          value: '3,291',  icon: CheckCircle,  color: '#C9A227' },
  { label: 'Active Maint. Teams',     value: '48',     icon: HardHat,      color: '#84d0a8' },
  { label: 'Regions Covered',         value: '14',     icon: Globe,        color: '#C9A227' },
];

const services = [
  {
    icon: MapPin,
    title: 'Precise Issue Reporting',
    desc: 'Report potholes, damaged signs, traffic lights, flooding and road blockages with GPS pin-point accuracy.',
    color: '#4ab47e',
    bg: 'rgba(74,180,126,0.10)',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Progress',
    desc: 'Monitor repair status from submission to completion with live updates and full status history.',
    color: '#C9A227',
    bg: 'rgba(201,162,39,0.10)',
  },
  {
    icon: Shield,
    title: 'Government-Grade Security',
    desc: 'Role-based access with JWT authentication ensures secure, accountable infrastructure management.',
    color: '#84d0a8',
    bg: 'rgba(132,208,168,0.10)',
  },
  {
    icon: Zap,
    title: 'Rapid Escalation',
    desc: 'Critical reports are flagged and routed to the right team instantly with automated notifications.',
    color: '#C9A227',
    bg: 'rgba(201,162,39,0.10)',
  },
];

const issueTypes = [
  { icon: '🕳️', label: 'Potholes',       count: '4,218' },
  { icon: '⚠️', label: 'Damaged Signs',   count: '1,832' },
  { icon: '🚦', label: 'Traffic Lights',  count: '672'   },
  { icon: '🌊', label: 'Flooded Roads',   count: '1,091' },
  { icon: '⚡', label: 'Cracked Roads',   count: '2,547' },
  { icon: '🚧', label: 'Blockages',       count: '487'   },
];

export default function LandingPage() {
  return (
    <div style={{ background: 'var(--surface-bg)', color: '#e2e8f0' }}>

      {/* ═══════════════════════ TOPBAR ══════════════════════ */}
      <header style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}
        className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RFAMark size={36} />
            <div>
              <div className="font-display font-bold text-white text-sm leading-tight">Road Fund Administration</div>
              <div className="text-xs" style={{ color: 'var(--rfa-gold)' }}>Republic of Namibia</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-sm font-medium text-surface-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-surface-800">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm">
              Get Started <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════ HERO ════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'var(--rfa-gradient)' }} />
        <div className="absolute inset-0 bg-hero-pattern" />

        {/* Ambient green glow */}
        <div className="absolute top-1/3 left-1/4 w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(26,122,74,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        {/* Gold glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.10) 0%, transparent 70%)', filter: 'blur(60px)' }} />

        {/* Moving road dashes */}
        <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden" style={{ opacity: 0.18 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.9, ease: 'linear' }}
              style={{ background: 'linear-gradient(90deg, transparent, #C9A227, transparent)' }}
              className="absolute top-1/2 h-0.5 w-24"
              style={{
                top: `${30 + i * 12}%`,
                background: 'linear-gradient(90deg, transparent, #C9A227, transparent)',
                height: '2px',
                width: '6rem',
              }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <motion.div initial="hidden" animate="show" variants={stagger}>
            {/* Eyebrow */}
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(26,122,74,0.18)', border: '1px solid rgba(26,122,74,0.35)', color: '#84d0a8' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
              Official Government Platform
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="font-display font-extrabold text-5xl lg:text-6xl text-white leading-[1.05] mb-6">
              Funding &amp; Maintaining<br />
              <span className="text-gradient-gold">Namibia's Roads</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-surface-300 text-lg leading-relaxed mb-8 max-w-lg">
              Report road defects, track maintenance progress and help keep
              Namibia's 48,754 km national road network safe — all in one
              government-grade platform.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary px-7 py-3.5 text-base">
                Report a Road Issue <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-outline-green px-7 py-3.5 text-base">
                Staff Sign In
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div variants={fadeUp}
              className="mt-10 flex items-center gap-6 pt-8"
              style={{ borderTop: '1px solid var(--surface-border)' }}>
              {[
                { val: '14', lbl: 'Regions' },
                { val: '99.8%', lbl: 'Uptime' },
                { val: '< 2 hrs', lbl: 'Avg. Response' },
              ].map(({ val, lbl }) => (
                <div key={lbl}>
                  <div className="font-display font-bold text-xl text-gradient-gold">{val}</div>
                  <div className="text-xs text-surface-500 mt-0.5">{lbl}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — issue type list */}
          <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-3">
            <motion.div variants={fadeUp}
              className="text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ color: 'var(--rfa-gold)' }}>
              Reported Issue Types
            </motion.div>
            {issueTypes.map(({ icon, label, count }) => (
              <motion.div key={label} variants={fadeUp}
                className="flex items-center gap-4 p-4 rounded-xl transition-all cursor-default"
                style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
                whileHover={{ borderColor: 'rgba(26,122,74,0.4)' }}>
                <span className="text-2xl w-8 text-center">{icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-white text-sm">{label}</div>
                  <div className="text-xs text-surface-500">Reported incidents</div>
                </div>
                <div className="font-display font-bold text-lg" style={{ color: 'var(--rfa-gold)' }}>{count}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════ STATS BAND ═══════════════════ */}
      <div className="py-12" style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
        <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div>
                <div className="font-display font-extrabold text-2xl text-white">{value}</div>
                <div className="text-xs text-surface-400">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════ SERVICES ═════════════════════ */}
      <section className="py-28" style={{ background: 'var(--surface-bg)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>

            <motion.div variants={fadeUp} className="text-center mb-16">
              <div className="flex justify-center mb-4">
                <span className="gold-rule" />
              </div>
              <h2 className="font-display font-bold text-4xl text-white mb-4">
                Everything You Need to Maintain<br />
                <span className="text-gradient">Namibia's Roads</span>
              </h2>
              <p className="text-surface-400 max-w-xl mx-auto">
                A complete digital ecosystem connecting citizens, inspectors, maintenance officers and administrators.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map(({ icon: Icon, title, desc, color, bg }) => (
                <motion.div key={title} variants={fadeUp}
                  className="p-6 rounded-2xl transition-all duration-300 group cursor-default"
                  style={{ background: 'var(--surface-card)', border: '1px solid var(--surface-border)' }}
                  whileHover={{ borderColor: `${color}40` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ background: bg, border: `1px solid ${color}25` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="font-display font-bold text-white mb-2 text-sm">{title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24" style={{ background: 'var(--surface-card)', borderTop: '1px solid var(--surface-border)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <div className="flex justify-center mb-4"><span className="gold-rule" /></div>
              <h2 className="font-display font-bold text-3xl text-white">How It Works</h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { n: '01', title: 'Report',   desc: 'Spot a road defect? Submit it in under 2 minutes with your location, photos and issue type.', color: '#4ab47e' },
                { n: '02', title: 'Inspect',  desc: 'Our field inspectors verify, classify severity and assign the right maintenance team.', color: '#C9A227' },
                { n: '03', title: 'Repair',   desc: 'Maintenance officers track progress to completion. You receive status updates automatically.', color: '#84d0a8' },
              ].map(({ n, title, desc, color }) => (
                <motion.div key={n} variants={fadeUp} className="text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 font-display font-black text-lg"
                    style={{ background: `${color}15`, border: `1.5px solid ${color}35`, color }}>
                    {n}
                  </div>
                  <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                  <p className="text-surface-400 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ CTA ════════════════════════ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a2010 0%, #061508 100%)' }} />
        <div className="absolute inset-0 bg-hero-pattern" />
        {/* Gold corner accent */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(201,162,39,0.12) 0%, transparent 70%)' }} />

        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-6">
              <span className="gold-rule" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-display font-extrabold text-4xl lg:text-5xl text-white mb-5">
              See a Road Problem?{' '}
              <span className="text-gradient-gold">Report It Now.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-surface-300 text-lg mb-10">
              Your report makes a difference. Join thousands of Namibians helping build safer, better roads.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary px-9 py-4 text-base">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-secondary px-9 py-4 text-base">
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════ FOOTER ══════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--surface-border)', background: 'var(--surface-card)' }}
        className="py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <RFAMark size={38} />
                <div>
                  <div className="font-display font-bold text-white">Road Fund Administration</div>
                  <div className="text-xs" style={{ color: 'var(--rfa-gold)' }}>Republic of Namibia</div>
                </div>
              </div>
              <p className="text-surface-400 text-sm max-w-xs leading-relaxed mb-4">
                Official road maintenance reporting and tracking platform.
                Shaping a sustainable, world-class transport sector.
              </p>
              <div className="text-xs text-surface-500">
                21 Sir Seretse Khama Street, Windhoek · Toll-Free: 0800 433 300
              </div>
            </div>

            <div>
              <div className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <span className="gold-rule !w-4 !h-0.5 inline-block" style={{ background: 'var(--rfa-gold)', width: '14px', height: '2px', display: 'inline-block', borderRadius: '1px' }} />
                Platform
              </div>
              <div className="space-y-2.5">
                {['Report Issue', 'Track Reports', 'Live Map', 'Analytics'].map((l) => (
                  <div key={l} className="text-surface-400 text-sm hover:text-brand-400 cursor-pointer transition-colors">{l}</div>
                ))}
              </div>
            </div>

            <div>
              <div className="font-semibold text-white text-sm mb-4 flex items-center gap-2">
                <span style={{ background: 'var(--rfa-gold)', width: '14px', height: '2px', display: 'inline-block', borderRadius: '1px' }} />
                RFA Official
              </div>
              <div className="space-y-2.5">
                {[
                  { l: 'rfanam.com.na', href: 'https://rfanam.com.na' },
                  { l: 'Online Payments', href: 'https://online.rfanam.com.na' },
                  { l: 'Privacy Policy', href: '#' },
                  { l: 'Contact Us', href: '#' },
                ].map(({ l, href }) => (
                  <a key={l} href={href} target="_blank" rel="noopener noreferrer"
                    className="block text-surface-400 text-sm hover:text-brand-400 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>

          <div className="divider-gold mb-6" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-surface-500 text-xs">© 2025 Road Fund Administration Namibia. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              <span className="text-surface-500 text-xs">System Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
