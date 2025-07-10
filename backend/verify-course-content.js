const mongoose = require('mongoose');
require('dotenv').config();

const ProgrammeModule = require('./dist/models/ProgrammeModule').default;
const ProgrammeLesson = require('./dist/models/ProgrammeLesson').default;

const programmeId = '686f5f0185350adfe788358a'; // Replace with your course ID

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const modules = await ProgrammeModule.find({ programmeId });
  console.log('Modules:', modules.map(m => ({ id: m._id, title: m.title })));

  for (const mod of modules) {
    const lessons = await ProgrammeLesson.find({ moduleId: mod._id });
    console.log(`  Lessons for module "${mod.title}":`, lessons.map(l => ({ id: l._id, title: l.title, type: l.type })));
  }
  await mongoose.disconnect();
}
run(); 