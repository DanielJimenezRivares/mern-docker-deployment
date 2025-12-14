import React from 'react';

const StickyStack = ({ onNewNote }) => {
  return (
    <div className="sticky-stack">
      <div className="sticky-stack-title">Sticky stack</div>
      <div className="sticky-stack-pad" aria-hidden="true">
        <div className="pad-sheet"></div>
        <div className="pad-sheet"></div>
        <div className="pad-sheet"></div>
      </div>
      <button onClick={onNewNote}>Grab a new sticky</button>
    </div>
  );
};

export default StickyStack;
