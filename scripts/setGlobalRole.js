import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
  try {
    console.log('--- 🛡️ QueSale Global Role Manager ---');
    
    const username = await askQuestion('Enter the username to modify (e.g. santipingui58): ');
    
    if (!username) {
      console.error('Username is required.');
      process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { username } });
    
    if (!user) {
      console.error(`❌ User '${username}' not found.`);
      process.exit(1);
    }
    
    console.log(`Current role for ${username}: ${user.global_role || 'user'}`);
    
    const roleInput = await askQuestion('Enter new role (admin / moderator / user): ');
    const newRole = roleInput.toLowerCase().trim();
    
    if (!['admin', 'moderator', 'user'].includes(newRole)) {
      console.error('❌ Invalid role. Must be admin, moderator, or user.');
      process.exit(1);
    }

    await prisma.user.update({
      where: { id_user: user.id_user },
      data: { global_role: newRole }
    });

    console.log(`✅ Success! '${username}' is now a global ${newRole.toUpperCase()}.`);
    
  } catch (error) {
    console.error('Fatal Error:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();