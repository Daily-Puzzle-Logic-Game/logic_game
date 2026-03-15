const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDailyScores() {
  const now = new Date();
  const todayStr = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  console.log(`Checking scores for: ${todayStr}`);
  
  try {
    const scores = await prisma.dailyScore.findMany({
      where: { date: todayStr },
      include: { user: { select: { name: true } } }
    });
    console.log(`Found ${scores.length} scores for today.`);
    scores.forEach(s => {
      console.log(`- ${s.user.name || 'Anon'}: ${s.score} pts`);
    });
    
    const allRecords = await prisma.dailyScore.findMany({
      select: { date: true, score: true, user: { select: { name: true } } }
    });
    console.log(`\nAll records in DailyScore:`);
    allRecords.forEach(r => {
      console.log(`- ${r.date}: ${r.user.name || 'Anon'} (${r.score} pts)`);
    });

    const totalCount = await prisma.dailyScore.count();
    console.log(`Total records: ${totalCount}`);
  } catch (err) {
    console.error('Error checking scores:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDailyScores();
