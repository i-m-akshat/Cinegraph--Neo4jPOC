import { useState } from 'react';
import { UserPlus, Edit2, Trash2, Search, Users, Baby, User } from 'lucide-react';
import { createActor, updatePersonBorn, deletePerson, getMovieActors } from '../services/api';
import { Person, AddToast } from '../types';
import { Modal } from '../components/Modal';

export function ActorsPage({ addToast }: { addToast: AddToast }) {
  const [createOpen, setCreateOpen]     = useState(false);
  const [updateOpen, setUpdateOpen]     = useState(false);
  const [deleteOpen, setDeleteOpen]     = useState(false);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [submitting, setSubmitting]     = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', born: 1990 });
  const [updateForm, setUpdateForm] = useState({ personName: '', newBornYear: 1980 });
  const [deleteName, setDeleteName] = useState('');

  const [movieTitle, setMovieTitle]     = useState('');
  const [movieActors, setMovieActors]   = useState<Person[] | null>(null);
  const [actorsLoading, setActorsLoading] = useState(false);

  const handleCreate = async () => {
    if (!createForm.name.trim()) return addToast('error', 'Name is required');
    setSubmitting(true);
    try {
      await createActor({ name: createForm.name.trim(), born: createForm.born });
      addToast('success', `Actor "${createForm.name}" created`);
      setCreateOpen(false); setCreateForm({ name: '', born: 1990 });
    } catch { addToast('error', 'Failed to create actor'); }
    finally { setSubmitting(false); }
  };

  const handleUpdate = async () => {
    if (!updateForm.personName.trim()) return addToast('error', 'Name is required');
    setSubmitting(true);
    try {
      await updatePersonBorn(updateForm.personName.trim(), updateForm.newBornYear);
      addToast('success', `Updated "${updateForm.personName}"`);
      setUpdateOpen(false);
    } catch { addToast('error', 'Failed to update — actor may not exist'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!deleteName.trim()) return addToast('error', 'Name is required');
    setSubmitting(true);
    try {
      await deletePerson(deleteName.trim());
      addToast('success', `Actor "${deleteName}" deleted`);
      setConfirmOpen(false); setDeleteOpen(false); setDeleteName('');
    } catch { addToast('error', 'Failed to delete actor'); }
    finally { setSubmitting(false); }
  };

  const handleSearch = async () => {
    if (!movieTitle.trim()) return addToast('info', 'Enter a movie title');
    setActorsLoading(true);
    try {
      const actors = await getMovieActors(movieTitle.trim());
      setMovieActors(actors);
      if (actors.length === 0) addToast('info', 'No actors found for that movie');
    } catch { addToast('error', 'Failed to fetch actors'); setMovieActors(null); }
    finally { setActorsLoading(false); }
  };

  const actions = [
    { label: 'Create Actor', desc: 'Add a new actor node', icon: UserPlus,
      color: '#7c3aed', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',
      onClick: () => setCreateOpen(true) },
    { label: 'Update Birth Year', desc: "Modify an actor's birth year", icon: Edit2,
      color: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.2)',
      onClick: () => setUpdateOpen(true) },
    { label: 'Delete Actor', desc: 'Remove actor and relationships', icon: Trash2,
      color: '#e11d48', bg: 'rgba(225,29,72,0.08)', border: 'rgba(225,29,72,0.18)',
      onClick: () => setDeleteOpen(true) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="section-label mb-1.5">Management</div>
        <h1 className="text-2xl font-bold gradient-text">Actors</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Action cards */}
        <div>
          <div className="section-label mb-4">Actor Operations</div>
          <div className="flex flex-col gap-3">
            {actions.map(({ label, desc, icon: Icon, color, bg, border, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="glass-card glass-card-hover p-5 flex items-center gap-4 w-full text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg, border: `1px solid ${border}` }}
                >
                  <Icon size={17} style={{ color }} strokeWidth={1.8} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5" style={{ color }}>{label}</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Movie actors search */}
        <div>
          <div className="section-label mb-4">Find Actors by Movie</div>
          <div className="glass-card p-6">
            <p className="text-xs mb-4" style={{ color: '#9ca3af' }}>
              Enter a movie title to see all actors who appeared in it.
            </p>
            <div className="flex gap-2.5 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(107,114,128,0.4)' }} />
                <input type="text" className="glass-input pl-9" placeholder="Movie title…"
                  value={movieTitle}
                  onChange={e => setMovieTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }} />
              </div>
              <button onClick={handleSearch} disabled={actorsLoading} className="btn-primary flex-shrink-0">
                {actorsLoading ? 'Loading…' : 'Search'}
              </button>
            </div>

            {movieActors !== null && (
              movieActors.length === 0 ? (
                <div className="empty-state py-6">
                  <Users size={28} className="mb-2" /><p className="text-xs">No actors found</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-xs mb-1" style={{ color: '#9ca3af' }}>
                    {movieActors.length} actor{movieActors.length !== 1 ? 's' : ''} found
                  </div>
                  {movieActors.map(actor => (
                    <div
                      key={actor.name}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.1)' }}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(139,92,246,0.1)' }}>
                        <User size={12} style={{ color: '#7c3aed' }} />
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: '#1e1b4b' }}>{actor.name}</div>
                        {actor.born > 0 && (
                          <div className="text-xs flex items-center gap-1" style={{ color: '#9ca3af' }}>
                            <Baby size={9} /> Born {actor.born}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create Actor" size="sm">
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">Full Name *</label>
            <input className="glass-input" placeholder="e.g. Keanu Reeves" value={createForm.name}
              onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="form-label">Birth Year</label>
            <input type="number" className="glass-input" value={createForm.born}
              onChange={e => setCreateForm(p => ({ ...p, born: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={handleCreate} disabled={submitting} className="btn-primary flex-1">
              <UserPlus size={13} />{submitting ? 'Creating…' : 'Create Actor'}
            </button>
            <button onClick={() => setCreateOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} title="Update Birth Year" size="sm">
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">Actor Name *</label>
            <input className="glass-input" placeholder="e.g. Keanu Reeves" value={updateForm.personName}
              onChange={e => setUpdateForm(p => ({ ...p, personName: e.target.value }))} autoFocus />
          </div>
          <div>
            <label className="form-label">New Birth Year *</label>
            <input type="number" className="glass-input" value={updateForm.newBornYear}
              onChange={e => setUpdateForm(p => ({ ...p, newBornYear: Number(e.target.value) }))} />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button onClick={handleUpdate} disabled={submitting} className="btn-secondary flex-1">
              <Edit2 size={13} />{submitting ? 'Updating…' : 'Update'}
            </button>
            <button onClick={() => setUpdateOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete — enter name */}
      <Modal isOpen={deleteOpen && !confirmOpen} onClose={() => setDeleteOpen(false)} title="Delete Actor" size="sm">
        <div className="flex flex-col gap-4">
          <div>
            <label className="form-label">Actor Name *</label>
            <input className="glass-input" placeholder="e.g. Keanu Reeves" value={deleteName}
              onChange={e => setDeleteName(e.target.value)} autoFocus />
          </div>
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => { if (deleteName.trim()) setConfirmOpen(true); else addToast('error','Enter a name'); }}
              className="btn-danger flex-1"
            >
              <Trash2 size={13} /> Continue
            </button>
            <button onClick={() => setDeleteOpen(false)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm Delete" size="sm">
        <p className="text-sm mb-1" style={{ color: '#374151' }}>
          Delete actor <strong style={{ color: '#e11d48' }}>{deleteName}</strong>?
        </p>
        <p className="text-xs mb-5" style={{ color: '#9ca3af' }}>
          Permanently removes the actor node and all their relationships.
        </p>
        <div className="flex gap-2.5">
          <button onClick={handleDelete} disabled={submitting} className="btn-danger flex-1">
            <Trash2 size={14} />{submitting ? 'Deleting…' : 'Delete'}
          </button>
          <button onClick={() => { setConfirmOpen(false); setDeleteOpen(false); setDeleteName(''); }}
            className="btn-ghost">Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
