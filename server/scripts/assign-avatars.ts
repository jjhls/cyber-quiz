import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🎨 Assigning random avatars to all users...');

  // Get list of available avatar files
  const uploadsDir = path.join(__dirname, '../uploads/avatars');
  if (!fs.existsSync(uploadsDir)) {
    console.error('❌ Avatar directory not found:', uploadsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(uploadsDir)
    .filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))
    .map(f => `/uploads/avatars/${f}`);

  if (files.length === 0) {
    console.error('❌ No avatar files found');
    process.exit(1);
  }

  console.log(`📸 Found ${files.length} avatar files`);

  // Get all users
  const users = await prisma.user.findMany();
  console.log(`👥 Found ${users.length} users`);

  // Assign random avatars
  let updated = 0;
  for (const user of users) {
    const randomAvatar = files[Math.floor(Math.random() * files.length)];
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: randomAvatar },
    });
    console.log(`  ✅ ${user.username} → ${randomAvatar}`);
    updated++;
  }

  console.log(`\n🎉 Updated ${updated} users with random avatars`);
}

main()
  .catch(e => {
    console.error('❌ Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
