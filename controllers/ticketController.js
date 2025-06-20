const Ticket = require('../models/Ticket');
const User = require('../models/User');

// @desc Create a new ticket
exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo, projectId } = req.body;

    let assignee = null;

    // If user entered something to assign, resolve it to a real user
    if (assignedTo) {
      assignee = await User.findOne({
        $or: [{ email: assignedTo }, { name: assignedTo }],
      });

      if (!assignee) {
        return res.status(404).json({ msg: 'Assigned user not found' });
      }
    }

    const ticket = await Ticket.create({
      title,
      description,
      priority,
      status,
      projectId,
      assignedTo: assignee ? assignee._id : null,
    });

    res.status(201).json(ticket);
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ msg: err.message });
  }
};

// @desc Get all tickets for a specific project
exports.getTicketsByProject = async (req, res) => {
  try {
    const tickets = await Ticket.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email'); // Include user info in response

    res.json(tickets);
  } catch (err) {
    console.error('Error fetching tickets:', err);
    res.status(500).json({ msg: err.message });
  }
};

// @desc Delete a ticket by ID
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    await ticket.deleteOne(); // Use deleteOne for clarity
    res.json({ msg: 'Ticket deleted successfully' });
  } catch (err) {
    console.error('Error deleting ticket:', err);
    res.status(500).json({ msg: err.message });
  }
};
