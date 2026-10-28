// THIS IS NOT YET FULLY TESTED!!

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const argv = process.argv
if (argv.length < 3) {
    console.log(`\n\n*** Usage: ${argv[1]} <projectName> \n`)
    process.exit()
}

const projectName = argv[2]
const repo = `https://github.com/cbevins/${projectName}.git`
const targetDir = process.cwd()
const opts =  { cwd: targetDir, stdio: 'ignore' }
const cmds = [
    'git init',
    'git add .',
    'git commit -m "initial commit"',
    'git branch -M main',
    `git remote add origin ${repo}`,
    'git push -u origin main'
]
try {
    console.log('📦  initializing git repository...');
    for(let cmd of cmds) {
        console.log(cmd, '...');
        // execSync(cmd, opts);
    }
    console.log(`\n✅ Successfully created ${projectName} git repository link!`);
} catch (error) {
    console.error('⚠️ Error during git init:', error.message);
}
