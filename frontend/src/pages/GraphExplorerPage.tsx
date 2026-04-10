import { useState } from 'react';
import { Share2, Link2, Unlink, Users, Search, User, ArrowRight } from 'lucide-react';
import { createRelationship, removeActorFromMovie, getCoActors } from '../services/api';
import { AddToast } from '../types';

export function GraphExplorerPage({ addToast }: { addToast: AddToast }) {
  const [relActor, setRelActor]   = useState('');
  const [relMovie, setRelMovie]   = useState('');
  const [relBusy, setRelBusy]     = useState(false);

  const [rmActor, setRmActor]     = useState('');
  const [rmMovie, setRmMovie]     = useState('');
  const [rmBusy, setRmBusy]       = useState(false);

  const [coName, setCoName]       = useState('');
  const [coActors, setCoActors]   = useState<string[] | null>(null);
  const [coBusy, setCoBusy]       = useState(false);

  const handleLink = async () => {
    if (!relActor.trim() || !relMovie.trim()) return addToast('error', 'Both fields are required');
    setRelBusy(true);
    try {
      await createRelationship(relActor.trim(), relMovie.trim());
      addToast('success', `Linked "${relActor}" → "${relMovie}"`);
      setRelActor(''); setRelMovie('');
    } catch { addToast('error', 'Failed — check that both actor and movie exist'); }
    finally { setRelBusy(false); }
  };

  const handleUnlink = async () => {
    if (!rmActor.trim() || !rmMovie.trim()) return addToast('error', 'Both fields are required');
    setRmBusy(true);
    try {
      await removeActorFromMovie(rmActor.trim(), rmMovie.trim());
      addToast('success', `Removed "${rmActor}" from "${rmMovie}"`);
      setRmActor(''); setRmMovie('');
    } catch { addToast('error', 'Failed — relationship may not exist'); }
    finally { setRmBusy(false); }
  };

  const handleCoSearch = async () => {
    if (!coName.trim()) return addToast('info', 'Enter an actor name');
    setCoBusy(true);
    try {
      const results = await getCoActors(coName.trim());
      setCoActors(results);
      if (results.length === 0) addToast('info', `No co-actors found for "${coName}"`);
    } catch { addToast('error', 'Failed to fetch co-actors'); setCoActors(null); }
    finally { setCoBusy(false); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="section-label mb-1.5">Relationships</div>
        <h1 className="text-2xl font-bold gradient-text">Graph Explorer</h1>
        <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
          Create and remove actor–movie relationships, and explore the co-actor network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Create Relationship */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.09)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Link2 size={16} style={{ color: '#7c3aed' }} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#7c3aed' }}>Link Actor to Movie</div>
              <div className="text-[11px]" style={{ color: '#9ca3af' }}>Create ACTED_IN relationship</div>
            </div>
          </div>

          {/* Diagram */}
          <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl mb-5"
            style={{ background: 'rgba(139,92,246,0.04)', border: '1px dashed rgba(139,92,246,0.18)' }}>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.22)', color: '#059669' }}>
              :Person
            </span>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#9ca3af' }}>
              <div className="w-4 h-px bg-lavender-300" />
              <span>ACTED_IN</span>
              <ArrowRight size={10} style={{ color: '#7c3aed' }} />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
              style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.22)', color: '#0284c7' }}>
              :Movie
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="form-label">Actor Name</label>
              <input className="glass-input" placeholder="e.g. Keanu Reeves" value={relActor}
                onChange={e => setRelActor(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Movie Title</label>
              <input className="glass-input" placeholder="e.g. The Matrix" value={relMovie}
                onChange={e => setRelMovie(e.target.value)} />
            </div>
            <button onClick={handleLink} disabled={relBusy} className="btn-primary w-full justify-center mt-1">
              <Link2 size={13} />{relBusy ? 'Linking…' : 'Create Link'}
            </button>
          </div>
        </div>

        {/* Remove Relationship */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(225,29,72,0.08)', border: '1px solid rgba(225,29,72,0.2)' }}>
              <Unlink size={16} style={{ color: '#e11d48' }} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#e11d48' }}>Remove from Movie</div>
              <div className="text-[11px]" style={{ color: '#9ca3af' }}>Delete ACTED_IN relationship</div>
            </div>
          </div>

          {/* Diagram */}
          <div className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl mb-5"
            style={{ background: 'rgba(225,29,72,0.03)', border: '1px dashed rgba(225,29,72,0.18)' }}>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#059669' }}>
              :Person
            </span>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#9ca3af' }}>
              <div className="w-4 h-px" style={{ background: '#fda4af' }} />
              <span className="line-through" style={{ color: '#e11d48' }}>ACTED_IN</span>
              <Share2 size={10} style={{ color: '#e11d48' }} />
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium"
              style={{ background: 'rgba(2,132,199,0.08)', border: '1px solid rgba(2,132,199,0.2)', color: '#0284c7' }}>
              :Movie
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="form-label">Actor Name</label>
              <input className="glass-input" placeholder="e.g. Keanu Reeves" value={rmActor}
                onChange={e => setRmActor(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Movie Title</label>
              <input className="glass-input" placeholder="e.g. The Matrix" value={rmMovie}
                onChange={e => setRmMovie(e.target.value)} />
            </div>
            <button onClick={handleUnlink} disabled={rmBusy} className="btn-danger w-full justify-center mt-1">
              <Unlink size={13} />{rmBusy ? 'Removing…' : 'Remove Link'}
            </button>
          </div>
        </div>

        {/* Co-actors */}
        <div className="glass-card p-6 flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)' }}>
              <Users size={16} style={{ color: '#059669' }} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: '#059669' }}>Find Co-Actors</div>
              <div className="text-[11px]" style={{ color: '#9ca3af' }}>Actors who shared a movie</div>
            </div>
          </div>

          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label className="form-label">Actor Name</label>
              <input className="glass-input" placeholder="e.g. Tom Hanks" value={coName}
                onChange={e => { setCoName(e.target.value); setCoActors(null); }}
                onKeyDown={e => { if (e.key === 'Enter') handleCoSearch(); }} />
            </div>
            <button onClick={handleCoSearch} disabled={coBusy} className="btn-secondary w-full justify-center">
              <Search size={13} />{coBusy ? 'Searching…' : 'Find Co-Actors'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72">
            {coActors === null ? (
              <div className="empty-state py-6">
                <Users size={28} className="mb-2" />
                <p className="text-xs">Enter an actor name to find their co-stars</p>
              </div>
            ) : coActors.length === 0 ? (
              <div className="empty-state py-6">
                <Users size={28} className="mb-2" /><p className="text-xs">No co-actors found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="text-xs mb-2" style={{ color: '#9ca3af' }}>
                  {coActors.length} co-actor{coActors.length !== 1 ? 's' : ''} found
                </div>
                {coActors.map(name => (
                  <div
                    key={name}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                    style={{ background: 'rgba(5,150,105,0.05)', border: '1px solid rgba(5,150,105,0.12)' }}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(5,150,105,0.12)' }}>
                      <User size={11} style={{ color: '#059669' }} />
                    </div>
                    <span className="text-sm" style={{ color: '#1e1b4b' }}>{name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Graph schema legend */}
      <div className="mt-8 glass-card p-5">
        <div className="section-label mb-3">Graph Schema</div>
        <div className="flex flex-wrap items-center gap-5 text-xs">
          {[
            { dot: '#059669', label: '(:Person)', desc: '— actor node with name, born' },
            { dot: '#0284c7', label: '(:Movie)',  desc: '— movie node with title, released, tagline' },
            { dot: '#7c3aed', label: '-[:ACTED_IN]→', desc: '— relationship between Person and Movie', square: true },
          ].map(({ dot, label, desc, square }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={square ? 'w-2.5 h-2.5 rounded' : 'w-2.5 h-2.5 rounded-full'}
                style={{ background: dot, boxShadow: `0 0 6px ${dot}80` }} />
              <span style={{ color: '#374151' }}>
                <strong style={{ color: dot }}>{label}</strong> <span style={{ color: '#9ca3af' }}>{desc}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
