const Project = require('../models/Project');
const User = require('../models/User');

// @desc Create new project with members by name
exports.createProject = async (req, res) => {
  const { title, description, members } = req.body;

  try {
    // Convert usernames (or emails) to ObjectIds
    const resolvedMembers = await Promise.all(
      (members || []).map(async (m) => {
        const user = await User.findOne({ name: m.userId }); // use { email: m.userId } if needed
        if (!user) throw new Error(`User ${m.userId} not found`);
        return user._id;
      })
    );

    // Add creator as default member
    if (!resolvedMembers.includes(req.user._id)) {
      resolvedMembers.push(req.user._id);
    }

    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      teamMembers: resolvedMembers,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message });
  }
};

// @desc Get all projects the user is part of
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      teamMembers: req.user._id,
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc Get project by ID with team member details
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('teamMembers', 'name email')
      .populate('createdBy', 'name');

    if (!project) return res.status(404).json({ msg: 'Project not found' });

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc Update a project and its members
exports.updateProject = async (req, res) => {
  const { title, description, members } = req.body;
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    // Resolve member names to ObjectIds
    const resolvedMembers = await Promise.all(
      (members || []).map(async (m) => {
        const user = await User.findOne({ name: m.userId }); // or email
        if (!user) throw new Error(`User ${m.userId} not found`);
        return user._id;
      })
    );

    project.title = title || project.title;
    project.description = description || project.description;
    project.teamMembers = resolvedMembers;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Failed to update project' });
  }
};

// @desc Delete project
exports.deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ msg: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc Add a member by user ID
exports.addMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Only the creator can add members' });
    }

    if (!project.teamMembers.includes(userId)) {
      project.teamMembers.push(userId);
      await project.save();
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// @desc Remove a member by user ID
exports.removeMember = async (req, res) => {
  const { projectId } = req.params;
  const { userId } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ msg: 'Project not found' });

    if (!project.createdBy.equals(req.user._id)) {
      return res.status(403).json({ msg: 'Only the creator can remove members' });
    }

    project.teamMembers = project.teamMembers.filter(id => id.toString() !== userId);
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
