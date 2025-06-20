const mongoose = require('mongoose');
const Project = require('../models/Project');
const User = require('../models/User');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const projects = await Project.find();

    for (const project of projects) {
      let updated = false;
      const resolvedMembers = [];

      for (const member of project.teamMembers) {
        if (typeof member === 'string') {
          const user = await User.findOne({ name: member });
          if (user) {
            resolvedMembers.push(user._id);
            updated = true;
          } else {
            console.log(`❌ User "${member}" not found for project ${project.title}`);
          }
        } else {
          resolvedMembers.push(member); // already ObjectId
        }
      }

      if (updated) {
        project.teamMembers = resolvedMembers;
        await project.save();
        console.log(`✅ Fixed members in project: ${project.title}`);
      }
    }

    console.log('✨ All projects checked.');
    process.exit();
  } catch (err) {
    console.error('❌ Script failed:', err);
    process.exit(1);
  }
};

run();
