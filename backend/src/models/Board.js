const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    columns: {
      type: [String],
      default: ['Ideas', 'In Progress', 'Done'] // 3 sections
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Board', BoardSchema);
