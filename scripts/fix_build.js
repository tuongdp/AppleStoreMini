const fs = require('fs');

let s = fs.readFileSync('D:/AppleStoreMini/src/routes.jsx', 'utf8');
s = s.split('\n').filter(l => 
    !l.includes('ResetPasswordPage') && 
    !l.includes('reset-password') && 
    !l.includes('AdminGlobalOptionsPage') && 
    !l.includes('path: "options"')
).join('\n');
fs.writeFileSync('D:/AppleStoreMini/src/routes.jsx', s, 'utf8');

let p = 'D:/AppleStoreMini/src/features/admin/components/products/AdminProductForm.jsx';
s = fs.readFileSync(p, 'utf8');
s = s.replace(/import.*useGetGlobalOptionsQuery.*from.*globalOptionsApi.*\n/g, '');
s = s.replace(/const.*globalColors.*useGetGlobalOptionsQuery.*\n/g, '');
s = s.replace(/const allColorOptions.*mapGlobalOptions\(globalColors\);\n/g, 'const allColorOptions = [];\n');
fs.writeFileSync(p, s, 'utf8');

console.log('Done');
