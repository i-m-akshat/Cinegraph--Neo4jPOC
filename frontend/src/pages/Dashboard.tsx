import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Users, Share2, Layers, ArrowRight, Star, Calendar, Tag } from 'lucide-react';
import { getAllMovies } from '../services/api';
import { Movie, AddToast } from '../types';

export function Dashboard({ addToast }: { addToast: AddToast }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllMovies()
      .then(setMovies)
      .catch(() => addToast('error', 'Failed to load movies'))
      .finally(() => setLoading(false));
  }, [addToast]);

  const quickActions = [
    {
      to: '/movies',
      label: 'Browse Movies',
      sub: 'View, create & manage movies',
      icon: Film,
      color: '#7c3aed',
      bg: 'rgba(139,92,246,0.08)',
      border: 'rgba(139,92,246,0.2)',
      shadow: '0 4px 20px rgba(139,92,246,0.12)',
    },
    {
      to: '/actors',
      label: 'Manage Actors',
      sub: 'Create, update & delete actors',
      icon: Users,
      color: '#059669',
      bg: 'rgba(5,150,105,0.08)',
      border: 'rgba(5,150,105,0.2)',
      shadow: '0 4px 20px rgba(5,150,105,0.1)',
    },
    {
      to: '/explore',
      label: 'Graph Explorer',
      sub: 'Link actors, find co-stars',
      icon: Share2,
      color: '#e11d48',
      bg: 'rgba(225,29,72,0.07)',
      border: 'rgba(225,29,72,0.18)',
      shadow: '0 4px 20px rgba(225,29,72,0.1)',
    },
    {
      to: '/movies',
      label: 'Merge / Upsert',
      sub: 'Create-or-update movie records',
      icon: Layers,
      color: '#d97706',
      bg: 'rgba(217,119,6,0.08)',
      border: 'rgba(217,119,6,0.2)',
      shadow: '0 4px 20px rgba(217,119,6,0.1)',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Hero */}
      <div className="mb-12">
        <div className="section-label mb-3">Welcome to</div>
        <h1 className="text-4xl font-bold tracking-tight mb-3 gradient-text">
          CineGraph Explorer
        </h1>
        <p className="text-base max-w-xl" style={{ color: '#6b7280' }}>
          A graph-powered movie database built on Neo4j. Explore actors, movies, and
          relationships through an elegant interface.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Movies', value: loading ? '–' : movies.length, color: '#7c3aed', glow: 'stat-glow-lavender' },
          { label: 'Graph Nodes', value: loading ? '–' : movies.length, color: '#059669', glow: 'stat-glow-mint' },
          { label: 'API Endpoints', value: '13', color: '#e11d48', glow: 'stat-glow-rose' },
          { label: 'Relationship', value: 'ACTED_IN', color: '#d97706', glow: 'stat-glow-amber' },
        ].map(({ label, value, color, glow }) => (
          <div key={label} className={`glass-card p-5 ${glow}`}>
            <div className="text-2xl font-bold font-mono mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-10">
        <div className="section-label mb-4">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map(({ to, label, sub, icon: Icon, color, bg, border, shadow }) => (
            <Link
              key={label}
              to={to}
              className="glass-card glass-card-hover p-5 group cursor-pointer block"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ background: bg, border: `1px solid ${border}`, boxShadow: shadow }}
              >
                <Icon size={18} style={{ color }} strokeWidth={1.8} />
              </div>
              <div className="font-semibold text-sm mb-1" style={{ color }}>
                {label}
              </div>
              <div className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
                {sub}
              </div>
              <div
                className="flex items-center gap-1 mt-3 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ color }}
              >
                Open <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent movies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="section-label">Recent Movies</div>
          <Link to="/movies" className="btn-ghost text-xs">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-1/3 mb-4" />
                <div className="skeleton h-3 w-full" />
                <div className="skeleton h-3 w-4/5 mt-1.5" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="glass-card empty-state">
            <Film size={36} className="mb-3" />
            <p className="text-sm" style={{ color: '#6b7280' }}>No movies yet. Add your first!</p>
            <Link to="/movies" className="btn-primary mt-4">Add Movie</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {movies.slice(0, 6).map(movie => (
              <Link
                key={movie.title}
                to={`/movies/${encodeURIComponent(movie.title)}`}
                className="glass-card glass-card-hover p-5 group block"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3
                    className="font-semibold text-sm leading-snug flex-1 pr-2 transition-colors"
                    style={{ color: '#1e1b4b' }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#7c3aed')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#1e1b4b')}
                  >
                    {movie.title}
                  </h3>
                  <span className="tag flex-shrink-0">
                    <Calendar size={9} className="mr-1" />{movie.released}
                  </span>
                </div>
                {movie.tagLine ? (
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: '#9ca3af' }}>
                    <Tag size={9} className="inline mr-1 opacity-60" />{movie.tagLine}
                  </p>
                ) : (
                  <p className="text-xs italic" style={{ color: '#d1d5db' }}>No tagline</p>
                )}
                <div
                  className="flex items-center gap-1 mt-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#7c3aed' }}
                >
                  <Star size={10} /><span>View details</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
