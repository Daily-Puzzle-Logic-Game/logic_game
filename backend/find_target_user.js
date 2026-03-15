const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, name: true, email: true, totalPoints: true, journeyLevel: true }
    });
    
    if (user) {
      console.log('User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log(`User with email ${email} not found.`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

const email = 'sahoogyanaranjan353@gmail.com';
checkUser(email);
