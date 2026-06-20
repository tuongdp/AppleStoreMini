const fs = require('fs');
const path = require('path');
const dir = 'D:/AppleStoreMini/src';

const FIXES = [
    // Replace .inStock with stock-based check
    [/\.inStock/g, '.stock > 0'],
    // Fix double operators from replacement
    [/stock > 0\s*\?\?\s*true/g, 'stock > 0'],
    [/\?\?\s*true\s*:\s*true/g, ''],
];

function walk(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const f of files) {
        const fp = path.join(dir, f.name);
        if (f.isDirectory() && !f.name.startsWith('node_modules') && !f.name.startsWith('dist')) walk(fp);
        else if (f.name.endsWith('.jsx') || f.name.endsWith('.js') || f.name.endsWith('.tsx') || f.name.endsWith('.ts')) {
            let content = fs.readFileSync(fp, 'utf8');
            const original = content;
            for (const [regex, replacement] of FIXES) {
                content = content.replace(regex, replacement);
            }
            if (content !== original) {
                fs.writeFileSync(fp, content, 'utf8');
                console.log('Fixed: ' + path.relative(dir, fp));
            }
        }
    }
}
walk(dir);
console.log('Done');
