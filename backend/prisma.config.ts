import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  migrate: {
    async adapter() {
      const { PrismaNeon } = await import('@prisma/adapter-neon');
      const { neon } = await import('@neondatabase/serverless');
      const neonSql = neon(process.env.DATABASE_URL!);
      return new PrismaNeon(neonSql);
    },
  },
});
