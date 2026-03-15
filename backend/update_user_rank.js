const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateRank(email, points) {
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { totalPoints: points }
    });
    console.log(`Successfully updated ${email} to ${points} points.`);
    console.log('New User Data:', JSON.stringify(user, null, 2));
  } catch (err) {
    console.error('Error updating user:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateRank('sahoogyanaranjan353@gmail.com', 880000);
