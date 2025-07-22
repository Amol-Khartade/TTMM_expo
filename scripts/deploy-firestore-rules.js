/**
 * Script to deploy Firestore rules
 * 
 * Usage:
 * - For development: node scripts/deploy-firestore-rules.js dev
 * - For production: node scripts/deploy-firestore-rules.js prod
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get environment from command line argument
const env = process.argv[2] || 'dev';

// Determine which rules file to use
const rulesFile = env === 'prod' ? 'firestore.rules' : 'firestore.rules.dev';
const rulesPath = path.join(__dirname, '..', rulesFile);

// Check if the rules file exists
if (!fs.existsSync(rulesPath)) {
  console.error(`Error: Rules file ${rulesPath} not found`);
  process.exit(1);
}

console.log(`Deploying ${rulesFile} to Firebase...`);

try {
  // Deploy the rules
  execSync(`firebase deploy --only firestore:rules -r ${rulesFile}`, {
    stdio: 'inherit'
  });
  
  console.log('Firestore rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firestore rules:', error.message);
  console.log('\nTo manually deploy rules:');
  console.log(`1. Install Firebase CLI: npm install -g firebase-tools`);
  console.log(`2. Login to Firebase: firebase login`);
  console.log(`3. Deploy rules: firebase deploy --only firestore:rules -r ${rulesFile}`);
  process.exit(1);
}