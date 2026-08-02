const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings/index.tsx', 'utf8');

// Update tabs array
const newTab = `  { id: "security", label: "أمان الإعدادات", icon: Lock },`;
content = content.replace("  { id: \"backup\", label: \"النسخ الاحتياطي\", icon: Database },", newTab + "\n  { id: \"backup\", label: \"النسخ الاحتياطي\", icon: Database },");

// Fix imports for Lock
content = content.replace("Activity,", "Activity, Lock,");

// Update renderTabContent
content = content.replace("      case \"backup\":", "      case \"security\":\n        return <SecurityTab />;\n      case \"backup\":");

// Write out file to apply initial changes
fs.writeFileSync('src/pages/Settings/index.tsx', content);
