const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const hash = process.env.ADMIN_PASSWORD_HASH;

if (!hash) {
  console.error('ADMIN_PASSWORD_HASH is not defined in .env');
  process.exit(1);
}

console.log('Hash from .env:', hash);
console.log('');

rl.question('Enter your password to test: ', async (password) => {
  const isValid = await bcrypt.compare(password, hash);
  console.log('');
  console.log('Password valid:', isValid);
  rl.close();
});
