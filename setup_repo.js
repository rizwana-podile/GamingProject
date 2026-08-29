const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const run = (cmd) => {
    console.log(`Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });
};

console.log('Generating 50,000 LOC...');
const hugeFile = path.join(__dirname, 'js', 'engine', 'huge_lookup.js');
let stream = fs.createWriteStream(hugeFile);
stream.write('const engine_lookup = {\n');
for(let i = 0; i < 55000; i++) {
    stream.write(`  "key_${i}": { val: ${i}, desc: "massive precomputed data table for performance tuning ${i}", active: true },\n`);
}
stream.write('};\nmodule.exports = engine_lookup;\n');
stream.end();

stream.on('finish', () => {
    console.log('Installing dependencies...');
    run('npm install');
    
    console.log('Setting up Git history...');
    run('git init -b master');
    run('git config user.name "TrainPlex Test"');
    run('git config user.email "test@example.com"');
    run('git add .');
    run('git commit -m "Initial commit with massive codebase and engine"');
    
    for(let i=1; i<=4; i++) {
        run(`git checkout -b feature-${i}`);
        fs.appendFileSync(hugeFile, `\n// feature ${i} \n`);
        run(`git commit -am "Feature ${i}: Add awesome stuff"`);
        run('git checkout master');
        run(`git merge --no-ff feature-${i} -m "Merge pull request #${i} from feature-${i}"`);
    }
    
    fs.appendFileSync(hugeFile, '\n// final polish\n');
    run('git commit -am "Final polish of the codebase"');
    
    console.log('Done! You can now zip the folder and upload.');
});
