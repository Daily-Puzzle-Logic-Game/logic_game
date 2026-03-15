const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserStreak() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, streakCount: true, lastPlayed: true }
    });
    console.log('User Streak Data:');
    users.forEach(u => {
      console.log(`- ${u.name || u.email}: Streak=${u.streakCount}, LastPlayed=${u.lastPlayed}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserStreak();
