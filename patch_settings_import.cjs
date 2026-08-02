const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings/index.tsx', 'utf8');

// Add import
const importToAdd = `import { SecurityTab } from './Tabs/SecurityTab';`;
content = content.replace("import { SystemHealth } from './Tabs/SystemHealth';", "import { SystemHealth } from './Tabs/SystemHealth';\n" + importToAdd);

// Change authentication logic
const oldAuthLogic = `            if (settingsPassword === 'admin' || settingsPassword === '123456') {`;
const newAuthLogic = `            const storedHash = localStorage.getItem('erp_settings_pwd');
            const defaultPwd = btoa('AdminCo123');
            const actualHash = storedHash || defaultPwd;
            
            if (btoa(settingsPassword) === actualHash) {`;

content = content.replace(oldAuthLogic, newAuthLogic);

fs.writeFileSync('src/pages/Settings/index.tsx', content);
