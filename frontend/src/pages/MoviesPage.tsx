import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Film, Plus, Search, Trash2, Eye, RefreshCw, Layers, X, Calendar, Tag } from 'lucide-react';
import { getAllMovies, createMovie, mergeMovie, deleteMovie } from '../services/api';
import { Movie, AddToast } from '../types';
import { Modal } from '../components/Modal';

const emptyForm = { title: '', released: new Date().getFullYear(), tagLine: '' };

export function MoviesPage({ addToast }: { addToast: AddToast }) {
  const [movies, setMovies]   = useState<Movie[]>([]);
  const [filtered, setFiltered] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingTitle, setDeletingTitle] = useState<string | null>(null);

  const [createOpen, setCreateOpen]       = useState(false);
  const [mergeOpen, setMergeOpen]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const [form, setForm]           = useState(emptyForm);
  const [mergeForm, setMergeForm] = useState(emptyForm);

  const load = useCallback(() => {
    setLoading(true);
    getAllMovies()
      .then(d => { setMovies(d); setFiltered(d); })
      .catch(() => addToast('error', 'Failed to load movies'))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFiltered(
      q
        ? movies.filter(m =>
            (m.title  ?? '').toLowerCase().includes(q) ||
            (m.tagLine ?? '').toLowerCase().includes(q) ||
            String(m.released).includes(q)
          )
        : movies
    );
  }, [search, movies]);

  const handleCreate = async () => {
    if (!form.title.trim()) return addToast('error', 'Title is required');
    setSubmitting(true);
    try {
      await createMovie({ ...form, title: form.title.trim(), tagLine: form.tagLine.trim() });
      addToast('success', `"${form.title}" created`);
      setCreateOpen(false); setForm(emptyForm); load();
    } catch { addToast('error', 'Failed to create movie'); }
    finally { setSubmitting(false); }
  };

  const handleMerge = async () => {
    if (!mergeForm.title.trim()) return addToast('error', 'Title is required');
    setSubmitting(true);
    try {
      await mergeMovie({ ...mergeForm, title: mergeForm.title.trim(), tagLine: mergeForm.tagLine.trim() });
      addToast('success', `"${mergeForm.title}" merged`);
      setMergeOpen(false); setMergeForm(emptyForm); load();
    } catch { addToast('error', 'Failed to merge movie'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (title: string) => {
    setDeletingTitle(title);
    try {
      await deleteMovie(title);
      addToast('success', `"${title}" deleted`);
      setConfirmDelete(null);
      setMovies(p => p.filter(m => m.title !== title));
    } catch { addToast('error', 'Failed to delete movie'); }
    finally { setDeletingTitle(null); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="section-label mb-1.5">Library</div>
          <h1 className="text-2xl font-bold gradient-text">Movies</h1>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button onClick={load} className="btn-ghost" title="Refresh"><RefreshCw size={14} /></button>
          <button onClick={() => setMergeOpen(true)} className="btn-secondary">
            <Layers size={14} /> Merge / Upsert
          </button>
          <button onClick={() => setCreateOpen(true)} className="btn-primary">
            <Plus size={14} /> Add Movie
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(107,114,128,0.5)' }}
        />
        <input
          type="text"
          className="glass-input pl-10 pr-10"
          placeholder="Search by title, tagline, or year…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'rgba(107,114,128,0.5)' }}
            onClick={() => setSearch('')}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {!loading && (
        <div className="text-xs mb-5" style={{ color: '#9ca3af' }}>
          {filtered.length} movie{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-4 w-3/4 mb-3" />
              <div className="skeleton h-3 w-1/3 mb-5" />
              <div className="skeleton h-3 w-full mb-1.5" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card empty-state">
          <Film size={40} className="mb-3" />
          <p className="text-sm mb-1" style={{ color: '#6b7280' }}>
            {search ? `No movies found for "${search}"` : 'No movies yet'}
          </p>
          <p className="text-xs" style={{ color: '#d1d5db' }}>
            {search ? 'Try a different search term' : 'Click "Add Movie" to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(movie => (
            <div key={movie.title} className="glass-card glass-card-hover flex flex-col p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="tag"><Calendar size={9} className="mr-1" />{movie.released}</span>
              </div>
              <h3 className="font-semibold text-sm leading-snug mb-2 flex-1" style={{ color: '#1e1b4b' }}>
                {movie.title}
              </h3>
              {movie.tagLine ? (
                <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: '#9ca3af' }}>
                  <Tag size={9} className="inline mr-1 opacity-60" />{movie.tagLine}
                </p>
              ) : (
                <p className="text-xs italic mb-4" style={{ color: '#d1d5db' }}>No tagline</p>
              )}
              <div
                className="flex gap-2 mt-auto pt-3"
                style={{ borderTop: '1px solid rgba(139,92,246,0.08)' }}
              >
                <Link
                  to={`/movies/${encodeURIComponent(movie.title)}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(139,92,246,0.07)',
                    color: '#7c3aed',
                    border: '1px solid rgba(139,92,246,0.15)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.14)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.28)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(139,92,246,0.07)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.15)';
                  }}
                >
                  <Eye size={12} /> View
                </Link>
                <button
                  onClick={() => setConfirmDelete(movie.title)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(225,29,72,0.06)',
                    color: '#e11d48',
                    border: '1px solid rgba(225,29,72,0.12)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(225,29,72,0.12)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(225,29,72,0.28)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(225,29,72,0.06)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(225,29,72,0.12)';
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Add New Movie">
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">Title *</label>
            <input className="glass-input" placeholder="e.g. The Matrix" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Release Year *</label>
            <input type="number" className="glass-input" value={form.released}
              onChange={e => setForm(p => ({ ...p, released: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="glass-input" placeholder="e.g. Free your mind." value={form.tagLine}
              onChange={e => setForm(p => ({ ...p, tagLine: e.target.value }))} />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={handleCreate} disabled={submitting} className="btn-primary flex-1">
              {submitting ? 'Creating…' : 'Create Movie'}
            </button>
            <button onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Merge Modal */}
      <Modal isOpen={mergeOpen} onClose={() => setMergeOpen(false)} title="Merge / Upsert Movie">
        <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
          Creates the movie if it doesn't exist, or updates it if it does.
        </p>
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">Title *</label>
            <input className="glass-input" placeholder="e.g. The Matrix" value={mergeForm.title}
              onChange={e => setMergeForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Release Year</label>
            <input type="number" className="glass-input" value={mergeForm.released}
              onChange={e => setMergeForm(p => ({ ...p, released: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="form-label">Tagline</label>
            <input className="glass-input" placeholder="e.g. Free your mind." value={mergeForm.tagLine}
              onChange={e => setMergeForm(p => ({ ...p, tagLine: e.target.value }))} />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={handleMerge} disabled={submitting} className="btn-secondary flex-1">
              <Layers size={14} />{submitting ? 'Merging…' : 'Merge Movie'}
            </button>
            <button onClick={() => setMergeOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={confirmDelete !== null} onClose={() => setConfirmDelete(null)} title="Delete Movie" size="sm">
        <p className="text-sm mb-1" style={{ color: '#374151' }}>
          Delete <strong style={{ color: '#e11d48' }}>{confirmDelete}</strong>?
        </p>
        <p className="text-xs mb-5" style={{ color: '#9ca3af' }}>
          This removes the movie node and all its relationships.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={() => confirmDelete && handleDelete(confirmDelete)}
            disabled={deletingTitle !== null}
            className="btn-danger flex-1"
          >
            <Trash2 size={14} />{deletingTitle ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={() => setConfirmDelete(null)} className="btn-ghost">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
