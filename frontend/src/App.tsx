import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './pages/Dashboard';
import { MoviesPage } from './pages/MoviesPage';
import { MovieDetailPage } from './pages/MovieDetailPage';
import { ActorsPage } from './pages/ActorsPage';
import { GraphExplorerPage } from './pages/GraphExplorerPage';
import { ToastMessage } from './types';

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastMessage['type'], message: string) => {
    setToasts(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"             element={<Dashboard        addToast={addToast} />} />
          <Route path="/movies"       element={<MoviesPage       addToast={addToast} />} />
          <Route path="/movies/:title" element={<MovieDetailPage addToast={addToast} />} />
          <Route path="/actors"       element={<ActorsPage       addToast={addToast} />} />
          <Route path="/explore"      element={<GraphExplorerPage addToast={addToast} />} />
        </Routes>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </Layout>
    </BrowserRouter>
  );
}

export default App;
