model Achievement {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  badgeType String   // e.g., 'SOLVED_50', 'STREAK_30', 'NO_HINTS'
  earnedAt  DateTime @default(now())

  @@unique([userId, badgeType])
}
