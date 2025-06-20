const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const auth = require('../middleware/authMiddleware');

// Create a new ticket
router.post('/', auth, ticketController.createTicket);

// Get all tickets for a specific project
router.get('/project/:projectId', auth, ticketController.getTicketsByProject);

// Delete a specific ticket
router.delete('/:ticketId', auth, async (req, res) => {
  try {
    await ticketController.deleteTicket(req, res);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
