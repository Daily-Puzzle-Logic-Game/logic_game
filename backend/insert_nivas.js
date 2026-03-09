const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
        data: {
            email: 'bvsnivaschowdary@gmail.com',
            password: hashedPassword,
            name: 'Nivas',
            picture: '',
            stats: { create: {} }
        }
    });
    console.log("Successfully created user:", user.email);
}
main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
