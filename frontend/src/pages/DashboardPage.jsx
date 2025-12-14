import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';

const DashboardPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const navigate = useNavigate();

  const fetchBoards = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/boards');
      setBoards(res.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const openBoard = (id) => {
    navigate(`/boards/${id}`);
  };

  // ----- ADD (inline) -----

  const startAdd = () => {
    setAdding(true);
    setNewTitle('');
  };

  const cancelAdd = () => {
    setAdding(false);
    setNewTitle('');
  };

  const submitAdd = async () => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const res = await api.post('/boards', { title });
      const newBoard = res.data;
      setBoards((prev) => [...prev, newBoard]);
      cancelAdd();
    } catch (err) {
      console.error(err);
      alert('Could not create board');
    }
  };

  const handleAddKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitAdd();
    } else if (e.key === 'Escape') {
      cancelAdd();
    }
  };

  // ----- EDIT (inline) -----

  const startEdit = (board) => {
    setEditingId(board._id);
    setEditingTitle(board.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const submitEdit = async () => {
    const title = editingTitle.trim();
    if (!title || !editingId) {
      cancelEdit();
      return;
    }
    try {
      const res = await api.put(`/boards/${editingId}`, { title });
      const updated = res.data;
      setBoards((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b))
      );
    } catch (err) {
      console.error(err);
      alert('Could not rename board');
    } finally {
      cancelEdit();
    }
  };

  const handleEditKey = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitEdit();
    } else if (e.key === 'Escape') {
      cancelEdit();
    }
  };

  // ----- DELETE -----

  const deleteBoard = async (board) => {
    try {
      await api.delete(`/boards/${board._id}`);
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
    } catch (err) {
      console.error(err);
      alert('Could not delete board');
    }
  };

  return (
    <div className="boards-page">
      <div className="boards-header">
        <h1>Your boards</h1>
      </div>

      {error && <div className="boards-error">{error}</div>}

      {loading ? (
        <div className="boards-loading">Loading boards…</div>
      ) : (
        <div className="boards-grid">
          {boards.map((board) => {
            const isEditing = editingId === board._id;
            return (
              <div
                key={board._id}
                className="board-card"
                onClick={() => !isEditing && openBoard(board._id)}
              >
                <div className="board-cork">
                  {/* TITLE AREA */}
                  <div className="board-title-area">
                    {isEditing ? (
                      <input
                        className="board-title-input"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={handleEditKey}
                        autoFocus
                      />
                    ) : (
                      <div className="board-title">{board.title}</div>
                    )}
                  </div>

                  {/* BUTTONS AT THE BOTTOM, CENTERED */}
                  <div className="board-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="board-action-btn board-action-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            submitEdit();
                          }}
                        >
                          ✓
                        </button>
                        <button
                          className="board-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEdit();
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="board-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(board);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="board-action-btn board-action-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBoard(board);
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ADD CARD */}
          {!adding ? (
            <button
              className="board-card board-card-add"
              onClick={startAdd}
            >
              <div className="board-cork board-cork-empty">
                <div className="board-add-plus">+</div>
                <div className="board-add-label">New board</div>
              </div>
            </button>
          ) : (
            <div className="board-card board-card-add board-card-add-form">
              <div className="board-cork">
                <div className="board-title-area">
                  <input
                    className="board-title-input"
                    placeholder="Board name"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleAddKey}
                    autoFocus
                  />
                </div>
                <div className="board-actions">
                  <button
                    className="board-action-btn board-action-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      submitAdd();
                    }}
                  >
                    ✓
                  </button>
                  <button
                    className="board-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      cancelAdd();
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
