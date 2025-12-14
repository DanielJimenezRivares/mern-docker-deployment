import React, { useEffect, useState } from 'react';
import api from '../api/client.js';
import { useNavigate } from 'react-router-dom';

const CorkboardList = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const res = await api.get('/boards');
      setBoards(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const createBoard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      await api.post('/boards', { title: newTitle });
      setNewTitle('');
      await fetchBoards();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <h2>Your Corkboards</h2>

      <form onSubmit={createBoard} style={{ marginBottom: '1rem' }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New board title"
          style={{ marginRight: '0.5rem', padding: '0.4rem 0.5rem' }}
        />
        <button type="submit" disabled={creating}>
          {creating ? 'Creating...' : 'Add Board'}
        </button>
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="board-grid">
          {boards.map((b) => (
            <div
              key={b._id}
              className="board-card"
              onClick={() => navigate(`/boards/${b._id}`)}
            >
              <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{b.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CorkboardList;
