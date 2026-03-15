const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserStreak() {
  try {
    const user = await prisma.user.update({
      where: { email: 'sahoo.gyanaranjan63@gmail.com' }, // Assuming this based on the context or name
      data: { streakCount: 3 }
    });
    console.log(`Updated Gyanaranjan Sahoo streak to: ${user.streakCount}`);
  } catch (err) {
    // If email is different, try by name
    try {
      const user = await prisma.user.updateMany({
        where: { name: 'Gyanaranjan Sahoo' },
        data: { streakCount: 3 }
      });
      console.log(`Updated ${user.count} records matching name 'Gyanaranjan Sahoo' to streak 3`);
    } catch (err2) {
      console.error(err2);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixUserStreak();
