// Deploy Firestore rules
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Deploying Firestore rules...');
console.log('Choose which rules to deploy:');
console.log('1. Development rules (allows all operations - NOT SECURE)');
console.log('2. Production rules (secure rules with proper permissions)');

rl.question('Enter your choice (1 or 2): ', (answer) => {
  try {
    if (answer === '1') {
      console.log('Deploying development rules...');
      execSync('firebase deploy --only firestore:rules -r firestore.rules.dev', { stdio: 'inherit' });
      console.log('Development rules deployed successfully!');
    } else if (answer === '2') {
      console.log('Deploying production rules...');
      execSync('firebase deploy --only firestore:rules -r firestore.rules', { stdio: 'inherit' });
      console.log('Production rules deployed successfully!');
    } else {
      console.log('Invalid choice. Please run the script again and enter 1 or 2.');
    }
  } catch (error) {
    console.error('Error deploying rules:', error.message);
  }
  rl.close();
});