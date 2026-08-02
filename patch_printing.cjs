const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings/Tabs/PrintingTab.tsx', 'utf8');

const newToggle = `  const toggleSetting = (key: keyof AppSettings) => {
    const currentVal = settings[key];
    const isTrue = currentVal === true || currentVal === 'true' || currentVal === 1 || currentVal === '1';
    onChange(key, isTrue ? 'false' : 'true');
  };
  const isChecked = (key: keyof AppSettings) => {
    const currentVal = settings[key];
    return currentVal === true || currentVal === 'true' || currentVal === 1 || currentVal === '1';
  };`;

content = content.replace(/  const toggleSetting = \[\s\S\]*?const isChecked = .*?;/s, newToggle);

// Replace just to be sure we are modifying the right block
content = content.replace(/const toggleSetting = \(key: keyof AppSettings\) => \{[\s\S]*?const isChecked = \(key: keyof AppSettings\) => [^;]+;/m, newToggle);

fs.writeFileSync('src/pages/Settings/Tabs/PrintingTab.tsx', content);
