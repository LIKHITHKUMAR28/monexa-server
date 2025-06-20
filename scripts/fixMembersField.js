const mongoose = require('mongoose');
const Project = require('../models/Project');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔌 Connected to MongoDB');

    const projects = await Project.find();

    for (const project of projects) {
      // Skip if already fixed
      if (project.teamMembers && project.teamMembers.length > 0) {
        continue;
      }

      if (Array.isArray(project.members)) {
        // Extract ObjectIds from "members" (which are wrapped in objects)
        const teamIds = project.members
          .map((m) => (m && m._id ? m._id : null))
          .filter(Boolean); // Remove nulls

        if (teamIds.length > 0) {
          project.teamMembers = teamIds;
          project.members = undefined; // remove old field
          await project.save();
          console.log(`✅ Fixed: ${project.title}`);
        }
      }
    }

    console.log('🎉 All projects processed.');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

run();
