const express = require('express');
const Board = require('../models/Board');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes here require auth
router.use(auth);

// GET /api/boards - list user's boards
router.get('/', async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user.id }).sort({ createdAt: 1 });
    res.json(boards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/boards - create board
router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.create({
      owner: req.user.id,
      title: title || 'New Corkboard'
    });
    res.status(201).json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/boards/:id - board with notes
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!board) return res.status(404).json({ message: 'Board not found' });

    const notes = await Note.find({ board: board._id }).sort({ column: 1, order: 1 });
    res.json({ board, notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/boards/:id - update title
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const board = await Board.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: { title } },
      { new: true }
    );
    if (!board) return res.status(404).json({ message: 'Board not found' });
    res.json(board);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/boards/:id
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    if (!board) return res.status(404).json({ message: 'Board not found' });
    await Note.deleteMany({ board: board._id });
    res.json({ message: 'Board and notes deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/boards/:id/notes - create a note (from sticky stack)
router.post('/:id/notes', async (req, res) => {
  try {
    const { text, column } = req.body;

    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const targetColumn = column || board.columns[0];

    const lastNote = await Note.findOne({ board: board._id, column: targetColumn })
      .sort({ order: -1 });

    const note = await Note.create({
      board: board._id,
      text: text || '',
      column: targetColumn,
      order: lastNote ? lastNote.order + 1 : 0
    });

    res.status(201).json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/boards/:id/notes/:noteId - update text or move note
router.put('/:id/notes/:noteId', async (req, res) => {
  try {
    const { text, column, order, x, y, width, height } = req.body;

    // ensure board belongs to user
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const note = await Note.findOne({ _id: req.params.noteId, board: board._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (typeof text === 'string') note.text = text;
    if (column) note.column = column;
    if (typeof order === 'number') note.order = order;
    if (typeof x === 'number') note.x = x;
    if (typeof y === 'number') note.y = y;
    if (typeof width === 'number') note.width = width;
    if (typeof height === 'number') note.height = height;

    await note.save();
    res.json(note);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/boards/:id/notes/:noteId
router.delete('/:id/notes/:noteId', async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id,
      owner: req.user.id
    });
    if (!board) return res.status(404).json({ message: 'Board not found' });

    const note = await Note.findOneAndDelete({ _id: req.params.noteId, board: board._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });

    res.json({ message: 'Note deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
