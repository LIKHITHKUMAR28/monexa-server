// server/models/Project.js

const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


module.exports = mongoose.model('Project', projectSchema);
