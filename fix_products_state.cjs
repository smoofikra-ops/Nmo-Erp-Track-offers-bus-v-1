const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

if (!code.includes('isSyncingImages')) {
  code = code.replace(/const \[imageUrl, setImageUrl\] = useState\(''\);/, "const [imageUrl, setImageUrl] = useState('');\n  const [isSyncingImages, setIsSyncingImages] = useState(false);\n  const [syncResult, setSyncResult] = useState<any>(null);");
  fs.writeFileSync('src/pages/Products/index.tsx', code);
}
