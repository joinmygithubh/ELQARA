import { fileURLToPath } from 'node:url';
import path from 'node:path';
import readline from 'node:readline';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Load environment variables from server/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) {
      parsed.email = args[++i];
    } else if (args[i] === '--password' && args[i + 1]) {
      parsed.password = args[++i];
    } else if (args[i] === '--name' && args[i + 1]) {
      parsed.name = args[++i];
    }
  }
  return parsed;
}

function promptText(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

function promptPassword(query) {
  return new Promise((resolve) => {
    process.stdout.write(query);

    if (process.stdin.isTTY && typeof process.stdin.setRawMode === 'function') {
      let password = '';
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding('utf8');

      const onData = (ch) => {
        const char = ch.toString();
        // Return / Enter
        if (char === '\n' || char === '\r' || char === '\u0004') {
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
        } else if (char === '\u0003') { // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdout.write('\nCancelled.\n');
          process.exit(1);
        } else if (char === '\b' || char === '\x7f') { // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          password += char;
          process.stdout.write('*');
        }
      };

      process.stdin.on('data', onData);
    } else {
      // Fallback if not interactive TTY (e.g., automated execution or piped input)
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      rl.question('', (ans) => {
        rl.close();
        resolve(ans.trim());
      });
    }
  });
}

async function createOrUpdateAdmin() {
  console.log('\n======================================================');
  console.log('       ELQARA Atelier — Secure Admin Account Setup     ');
  console.log('======================================================\n');

  const cliArgs = parseArgs();

  // 1. Determine Email
  let email = cliArgs.email || process.env.ADMIN_EMAIL;
  if (!email) {
    email = await promptText('Enter Admin Email Address: ');
  }
  email = (email || '').trim().toLowerCase();

  const emailRegex = /\S+@\S+\.\S+/;
  if (!email || !emailRegex.test(email)) {
    console.error('\n[Error]: Invalid email address format. Please enter a valid email.');
    process.exit(1);
  }

  // 2. Determine Name
  let name = cliArgs.name || process.env.ADMIN_NAME;
  if (!name && !cliArgs.email && !process.env.ADMIN_EMAIL) {
    name = await promptText('Enter Admin Full Name [ELQARA Administrator]: ');
  }
  if (!name) {
    name = 'ELQARA Administrator';
  }

  // 3. Determine Password
  let password = cliArgs.password || process.env.ADMIN_PASSWORD;
  if (!password) {
    password = await promptPassword('Enter Admin Password (minimum 6 characters): ');
    if (password.length < 6) {
      console.error('\n[Error]: Password must be at least 6 characters long.');
      process.exit(1);
    }

    const confirmPassword = await promptPassword('Confirm Admin Password: ');
    if (password !== confirmPassword) {
      console.error('\n[Error]: Passwords do not match.');
      process.exit(1);
    }
  }

  if (password.length < 6) {
    console.error('\n[Error]: Password must be at least 6 characters long.');
    process.exit(1);
  }

  // 4. Connect to MongoDB
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('\n[Error]: MONGO_URI is missing from server/.env');
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8000
  });
  console.log('Connected to database successfully.');

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      existingUser.name = name || existingUser.name || 'ELQARA Administrator';
      existingUser.role = 'admin';
      existingUser.isBlocked = false;
      existingUser.password = password; // triggers pre('save') bcrypt hash
      await existingUser.save();
      console.log(`\n✔ [SUCCESS] Existing user "${email}" upgraded to Administrator.`);
    } else {
      await User.create({
        name,
        email,
        password,
        role: 'admin',
        isBlocked: false
      });
      console.log(`\n✔ [SUCCESS] First Administrator account created for "${email}".`);
    }

    // 5. Verify bcrypt hashing and authentication capability
    const verifyUser = await User.findOne({ email }).select('+password');
    if (!verifyUser) {
      throw new Error('Verification failed: User record could not be retrieved after save.');
    }

    const passwordMatches = await verifyUser.comparePassword(password);
    if (!passwordMatches) {
      throw new Error('Verification failed: Bcrypt password comparison failed.');
    }

    console.log('✔ [VERIFIED] Password securely hashed with bcrypt and verified.');
    console.log(`✔ [VERIFIED] User role confirmed as: "${verifyUser.role}".`);
    console.log(`✔ [VERIFIED] Active status: isBlocked = ${verifyUser.isBlocked}.`);
    console.log('\n------------------------------------------------------');
    console.log('Admin Login URL : http://localhost:5173/admin/login');
    console.log('Admin Dashboard : http://localhost:5173/admin');
    console.log('------------------------------------------------------\n');
  } catch (err) {
    console.error('\n[Error creating admin]:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

createOrUpdateAdmin();
