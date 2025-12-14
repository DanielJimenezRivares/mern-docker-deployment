import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import StickyNote from './StickyNote.jsx';

const CorkboardView = () => {
  const { boardId } = useParams();
  const navigate = useNavigate();

  const [board, setBoard] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [draggingId, setDraggingId] = useState(null);
  const [resizingId, setResizingId] = useState(null);

  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  const notesRef = useRef([]);
  const boardRef = useRef(null);
  const pendingNewRef = useRef(null); // temp-id when dragging from stack
  const prevSizeRef = useRef({ width: null, height: null });

  // ------------------ Fetch board + notes ------------------ //

  const fetchBoard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/boards/${boardId}`);
      const b = res.data.board;
      const n = res.data.notes;

      const cols = b.columns || [];

      const processed = n.map((note, index) => {
        if (
          typeof note.x === 'number' &&
          typeof note.y === 'number' &&
          typeof note.width === 'number' &&
          typeof note.height === 'number'
        ) {
          return note;
        }

        const colIndex = Math.max(0, cols.indexOf(note.column));
        const baseX = 80 + colIndex * (window.innerWidth / 3);
        const baseY = 140;

        return {
          ...note,
          x: note.x ?? baseX + ((index * 20) % 140),
          y: note.y ?? baseY + ((index * 18) % 180),
          width: note.width ?? 180,
          height: note.height ?? 140,
        };
      });

      setBoard(b);
      setNotes(processed);
      notesRef.current = processed;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [boardId]);

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  const rawColumns = board?.columns || ['Ideas', 'In Progress', 'Done'];
  const displayColumns = rawColumns.map((c) => (c === 'Ideas' ? 'To Do' : c));

  // ------------------ Stack: drag to create new sticky ------------------ //

  const handleStackMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();

    const x = rect.width - 240;
    const y = rect.height - 240;

    const tempId = `temp-${Date.now()}`;
    const newNote = {
      _id: tempId,
      text: '',
      column: rawColumns[0] || 'Ideas',
      x,
      y,
      width: 180,
      height: 140,
    };

    pendingNewRef.current = tempId;

    const updated = [...notesRef.current, newNote];
    notesRef.current = updated;
    setNotes(updated);

    setDraggingId(tempId);
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + x),
      y: e.clientY - (rect.top + y),
    };
  };

  // ------------------ Text changes ------------------ //

  const handleTextChange = async (id, text) => {
    if (id.startsWith('temp-')) {
      const updated = notesRef.current.map((n) =>
        n._id === id ? { ...n, text } : n
      );
      notesRef.current = updated;
      setNotes(updated);
      return;
    }

    try {
      const res = await api.put(`/boards/${boardId}/notes/${id}`, { text });
      const updated = notesRef.current.map((n) =>
        n._id === id ? res.data : n
      );
      notesRef.current = updated;
      setNotes(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ Delete note ------------------ //

  const handleDeleteNote = async (id) => {
    if (id.startsWith('temp-')) {
      const updated = notesRef.current.filter((n) => n._id !== id);
      notesRef.current = updated;
      setNotes(updated);
      return;
    }

    try {
      await api.delete(`/boards/${boardId}/notes/${id}`);
      const updated = notesRef.current.filter((n) => n._id !== id);
      notesRef.current = updated;
      setNotes(updated);
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ Drag existing note ------------------ //

  const startDrag = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    const container = boardRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const note = notesRef.current.find((n) => n._id === id);
    if (!note) return;

    setDraggingId(id);
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + note.x),
      y: e.clientY - (rect.top + note.y),
    };
  };

  // ------------------ Resize note ------------------ //

  const startResize = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    const note = notesRef.current.find((n) => n._id === id);
    if (!note) return;

    setResizingId(id);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: note.width || 180,
      height: note.height || 140,
    };
  };

  // ------------------ Drag + resize handlers ------------------ //

  useEffect(() => {
    const handleMove = (e) => {
      const container = boardRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();

      // Dragging
      if (draggingId) {
        const rawX = e.clientX - rect.left - dragOffsetRef.current.x;
        const rawY = e.clientY - rect.top - dragOffsetRef.current.y;

        const x = Math.min(Math.max(rawX, 0), rect.width - 190);
        const y = Math.min(Math.max(rawY, 60), rect.height - 150);

        const updated = notesRef.current.map((n) =>
          n._id === draggingId ? { ...n, x, y } : n
        );
        notesRef.current = updated;
        setNotes(updated);
      }

      // Resizing
      if (resizingId) {
        const note = notesRef.current.find((n) => n._id === resizingId);
        if (!note) return;

        const dx = e.clientX - resizeStartRef.current.mouseX;
        const dy = e.clientY - resizeStartRef.current.mouseY;

        const newWidth = Math.max(140, resizeStartRef.current.width + dx);
        const newHeight = Math.max(110, resizeStartRef.current.height + dy);

        const updated = notesRef.current.map((n) =>
          n._id === resizingId ? { ...n, width: newWidth, height: newHeight } : n
        );
        notesRef.current = updated;
        setNotes(updated);
      }
    };

    const handleUp = async () => {
      const container = boardRef.current;
      if (!container) return;

      // Finish resizing
      if (resizingId) {
        const note = notesRef.current.find((n) => n._id === resizingId);
        setResizingId(null);

        if (note && !note._id.startsWith('temp-')) {
          try {
            await api.put(`/boards/${boardId}/notes/${note._id}`, {
              width: note.width,
              height: note.height,
            });
          } catch (err) {
            console.error(err);
          }
        }
      }

      // Finish dragging
      if (draggingId) {
        const note = notesRef.current.find((n) => n._id === draggingId);
        const isTemp = pendingNewRef.current === draggingId;
        setDraggingId(null);

        if (!note) return;

        const rect = container.getBoundingClientRect();
        const width = rect.width;
        const zoneWidth = width / 3;
        const x = note.x;

        let newColumn = rawColumns[0];
        if (x > zoneWidth * 2) {
          newColumn = rawColumns[2] || rawColumns[rawColumns.length - 1];
        } else if (x > zoneWidth) {
          newColumn = rawColumns[1] || rawColumns[0];
        }

        try {
          if (isTemp) {
            const createRes = await api.post(`/boards/${boardId}/notes`, {
              text: note.text || '',
              column: newColumn,
            });

            const created = {
              ...createRes.data,
              x: note.x,
              y: note.y,
              width: note.width,
              height: note.height,
              column: newColumn,
            };

            await api.put(`/boards/${boardId}/notes/${created._id}`, {
              x: created.x,
              y: created.y,
              width: created.width,
              height: created.height,
            });

            const updated = notesRef.current.map((n) =>
              n._id === note._id ? created : n
            );
            notesRef.current = updated;
            setNotes(updated);
            pendingNewRef.current = null;
          } else {
            await api.put(`/boards/${boardId}/notes/${note._id}`, {
              x: note.x,
              y: note.y,
              column: newColumn,
            });

            const updated = notesRef.current.map((n) =>
              n._id === note._id ? { ...n, column: newColumn } : n
            );
            notesRef.current = updated;
            setNotes(updated);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [draggingId, resizingId, rawColumns, boardId]);

  // ------------------ SCALE positions on window resize ------------------ //

  useEffect(() => {
    const handleResize = () => {
      const container = boardRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const prev = prevSizeRef.current;

      if (!prev.width || !prev.height) {
        prevSizeRef.current = { width: rect.width, height: rect.height };
        return;
      }

      const ratioX = rect.width / prev.width;
      const ratioY = rect.height / prev.height;

      if (!isFinite(ratioX) || !isFinite(ratioY)) return;

      const scaled = notesRef.current.map((n) => ({
        ...n,
        x: n.x * ratioX,
        y: n.y * ratioY,
      }));

      notesRef.current = scaled;
      setNotes(scaled);

      prevSizeRef.current = { width: rect.width, height: rect.height };
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // initialise prevSize when board first renders
  useEffect(() => {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    prevSizeRef.current = { width: rect.width, height: rect.height };
  }, [board]);

  // ------------------ Render ------------------ //

  if (loading) return <div>Loading board...</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div className="corkboard-page" ref={boardRef}>
      <button
        className="cork-back-btn"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      
      {/* Section titles */}
      <div className="corkboard-section-labels">
        {displayColumns.map((label) => (
          <div key={label} className="corkboard-section-label">
            {label}
          </div>
        ))}
      </div>

      {/* Notes layer */}
      <div className="corkboard-notes-layer">
        {notes.map((note) => (
          <StickyNote
            key={note._id}
            note={note}
            isDragging={draggingId === note._id}
            onTextChange={(text) => handleTextChange(note._id, text)}
            onDragMouseDown={(e) => startDrag(note._id, e)}
            onResizeMouseDown={(e) => startResize(note._id, e)}
            onDelete={() => handleDeleteNote(note._id)}
          />
        ))}
      </div>

      {/* Sticky stack in bottom-right: DRAG to grab a new sticky */}
      <div className="sticky-stack" onMouseDown={handleStackMouseDown}>
        <div className="sticky-stack-pad">
          <div className="pad-sheet"></div>
          <div className="pad-sheet"></div>
          <div className="pad-sheet"></div>
          <div className="sticky-stack-label">Grab a sticky</div>
        </div>
      </div>
    </div>
  );
};

export default CorkboardView;
