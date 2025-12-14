const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    text: { type: String, default: '' },
    column: { type: String, required: true },
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 },

    // NEW:
    width: { type: Number, default: 180 },
    height: { type: Number, default: 140 },

    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', NoteSchema);
