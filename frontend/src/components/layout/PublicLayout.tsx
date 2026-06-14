import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-surface-950/90 backdrop-blur-xl border-b border-surface-800 py-3' : 'py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9">
            <div className="absolute inset-0 bg-brand-600 rounded-lg rotate-3 group-hover:rotate-6 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-400 to-brand-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">RF</span>
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-white text-sm leading-tight">Road Fund</div>
            <div className="text-surface-400 text-xs">Administration Namibia</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {['#about', '#services', '#statistics'].map((href) => (
            <a key={href} href={href}
              className="px-4 py-2 text-surface-400 hover:text-white text-sm font-medium rounded-lg hover:bg-surface-800 transition-all capitalize">
              {href.slice(1)}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary text-sm">
              Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm">
                Report Issue <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-surface-400 hover:text-white">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-surface-950/95 backdrop-blur-xl border-b border-surface-800 px-6 py-4">
            <div className="flex flex-col gap-2">
              {['#about', '#services', '#statistics'].map((href) => (
                <a key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-surface-300 hover:text-white rounded-xl hover:bg-surface-800 capitalize">
                  {href.slice(1)}
                </a>
              ))}
              <div className="border-t border-surface-800 pt-3 mt-2 flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary justify-center">Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary justify-center">Sign In</Link>
                    <Link to="/register" className="btn-primary justify-center">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface-950">
      <Navbar />
      <Outlet />
    </div>
  );
}
