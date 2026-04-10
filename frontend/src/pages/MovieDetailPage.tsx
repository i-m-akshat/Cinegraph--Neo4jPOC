import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Tag, Users, Edit2, Trash2, User, Baby } from 'lucide-react';
import { getMovieWithActors, updateMovieTagline, deleteMovie } from '../services/api';
import { MovieWithActors, AddToast } from '../types';
import { Modal } from '../components/Modal';

export function MovieDetailPage({ addToast }: { addToast: AddToast }) {
  const { title } = useParams<{ title: string }>();
  const navigate = useNavigate();

  const [data, setData]       = useState<MovieWithActors | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [editOpen, setEditOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newTagline, setNewTagline] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    if (!title) return;
    setLoading(true);
    getMovieWithActors(decodeURIComponent(title))
      .then(d => { setData(d); setNewTagline(d.movie.tagLine || ''); })
      .catch(err => {
        if (err?.response?.status === 404) setNotFound(true);
        else addToast('error', 'Failed to load movie');
      })
      .finally(() => setLoading(false));
  }, [title, addToast]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateTagline = async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      await updateMovieTagline(data.movie.title, newTagline);
      addToast('success', 'Tagline updated');
      setEditOpen(false); load();
    } catch { addToast('error', 'Failed to update tagline'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!data) return;
    setSubmitting(true);
    try {
      await deleteMovie(data.movie.title);
      addToast('success', `"${data.movie.title}" deleted`);
      navigate('/movies');
    } catch { addToast('error', 'Failed to delete movie'); setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="skeleton h-5 w-24 mb-8" />
        <div className="glass-card p-8">
          <div className="skeleton h-8 w-2/3 mb-4" />
          <div className="skeleton h-4 w-1/4 mb-3" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="glass-card empty-state">
          <p className="text-sm mb-4" style={{ color: '#6b7280' }}>Movie not found</p>
          <Link to="/movies" className="btn-primary"><ArrowLeft size={14} /> Back to Movies</Link>
        </div>
      </div>
    );
  }

  const { movie, actors } = data;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link to="/movies" className="btn-ghost mb-8 inline-flex">
        <ArrowLeft size={14} /> Movies
      </Link>

      {/* Movie hero */}
      <div
        className="glass-card p-8 mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(139,92,246,0.05) 0%, rgba(5,150,105,0.04) 100%)',
          border: '1px solid rgba(139,92,246,0.18)',
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="tag"><Calendar size={9} className="mr-1" />{movie.released}</span>
              <span className="tag-mint">
                <Users size={9} className="mr-1" />
                {actors.length} actor{actors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight" style={{ color: '#1e1b4b' }}>
              {movie.title}
            </h1>
            {movie.tagLine ? (
              <p className="text-sm italic" style={{ color: '#6b7280' }}>
                <Tag size={11} className="inline mr-1.5 opacity-60" />{movie.tagLine}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: '#d1d5db' }}>No tagline set</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setEditOpen(true)} className="btn-primary">
              <Edit2 size={13} /> Edit Tagline
            </button>
            <button onClick={() => setDeleteOpen(true)} className="btn-danger">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Cast */}
      <div>
        <div className="section-label mb-4">Cast</div>
        {actors.length === 0 ? (
          <div className="glass-card empty-state">
            <Users size={32} className="mb-2" />
            <p className="text-sm" style={{ color: '#6b7280' }}>No actors linked to this movie</p>
            <Link to="/explore" className="btn-secondary mt-4">Go to Graph Explorer</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {actors.map(actor => (
              <div key={actor.name} className="glass-card glass-card-hover p-4 flex flex-col items-center text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.18)' }}
                >
                  <User size={16} style={{ color: '#7c3aed' }} />
                </div>
                <div className="font-medium text-sm mb-1" style={{ color: '#1e1b4b' }}>{actor.name}</div>
                {actor.born > 0 && (
                  <div className="text-xs flex items-center gap-1" style={{ color: '#9ca3af' }}>
                    <Baby size={9} /> {actor.born}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Tagline Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Tagline" size="sm">
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">New Tagline</label>
            <input className="glass-input" placeholder="Enter a tagline…" value={newTagline}
              onChange={e => setNewTagline(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-2.5">
            <button onClick={handleUpdateTagline} disabled={submitting} className="btn-primary flex-1">
              <Edit2 size={13} />{submitting ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setEditOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Movie" size="sm">
        <p className="text-sm mb-1" style={{ color: '#374151' }}>
          Delete <strong style={{ color: '#e11d48' }}>{movie.title}</strong>?
        </p>
        <p className="text-xs mb-5" style={{ color: '#9ca3af' }}>
          Removes the movie node and all ACTED_IN relationships.
        </p>
        <div className="flex gap-2.5">
          <button onClick={handleDelete} disabled={submitting} className="btn-danger flex-1">
            <Trash2 size={14} />{submitting ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={() => setDeleteOpen(false)} className="btn-ghost">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
