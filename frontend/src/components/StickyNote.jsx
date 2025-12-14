import React, { useState, useEffect, useRef } from 'react';

const BASE_WIDTH = 180;
const BASE_HEIGHT = 140;
const BASE_FONT = 1.2; // rem

const StickyNote = ({
  note,
  isDragging,
  onTextChange,
  onDragMouseDown,
  onDelete,
  onResizeMouseDown,
}) => {
  const [text, setText] = useState(note.text || '');
  const [tiltClass, setTiltClass] = useState('sticky-tilt-0');
  const textareaRef = useRef(null);

  useEffect(() => {
    const idx = Math.floor(Math.random() * 4);
    setTiltClass(`sticky-tilt-${idx}`);
  }, [note._id]);

  useEffect(() => {
    setText(note.text || '');
  }, [note.text]);

  const handleBlur = () => {
    if (text !== note.text) {
      onTextChange(text);
    }
  };

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const width = note.width || BASE_WIDTH;
  const height = note.height || BASE_HEIGHT;
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);
  const fontSize = `${BASE_FONT * scale}rem`;

  return (
    <div
      className={`sticky-note ${tiltClass} ${isDragging ? 'dragging' : ''}`}
      style={{ left: note.x, top: note.y, width, height }}
      onClick={focusTextarea}
    >
      <div className="sticky-note-pin" />

      {/* top strip is the drag handle */}
      <div
        className="sticky-note-grab"
        onMouseDown={onDragMouseDown}
      />

      {/* delete button */}
      <div
        className="sticky-delete"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        ×
      </div>
      <div className="sticky-text-wrapper">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={handleBlur}
          placeholder="Click to write..."
          onMouseDown={(e) => e.stopPropagation()}
          style={{ fontSize }}
        />
      </div>

      {/* resize handle */}
      <div
        className="sticky-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeMouseDown(e);
        }}
      />
    </div>
  );
};

export default StickyNote;
