// server/routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

router.post('/:projectId/add-member', protect, addMember);
router.post('/:projectId/remove-member', protect, removeMember);

module.exports = router;
