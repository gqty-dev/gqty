import schedule from 'node-schedule';

import { prisma } from './db';

const wipe = async () => {
  try {
    await prisma.$transaction([
      prisma.post.deleteMany(),
      prisma.user.deleteMany(),
      prisma.category.deleteMany(),
      prisma.profile.deleteMany(),
    ]);
    console.log('Database wipe complete!', new Date().toISOString());
  } catch (err) {
    console.error('Error while trying to wipe:');
    console.error(err);
  }
};

schedule.scheduleJob('0 0 * * *', wipe);
