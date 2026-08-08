const fs = require('fs');

let code = fs.readFileSync('src/pages/Settings/index.tsx', 'utf8');

const archiveImport = `import { ArchiveCenterTab } from "./Tabs/ArchiveCenterTab";\nimport { Archive } from "lucide-react";`;

if (!code.includes('ArchiveCenterTab')) {
  code = code.replace('import { UsersTab } from "./Tabs/UsersTab";', 'import { UsersTab } from "./Tabs/UsersTab";\n' + archiveImport);
}

if (!code.includes('{ id: "archive"')) {
  code = code.replace('{ id: "backup", label: "النسخ الاحتياطي", icon: Database },', '{ id: "backup", label: "النسخ الاحتياطي", icon: Database },\n  { id: "archive", label: "مركز الأرشيف", icon: Archive },');
}

const archiveCase = `
      case "archive":
        return <ArchiveCenterTab />;
`;

if (!code.includes('case "archive":')) {
  code = code.replace('case "health":', archiveCase + '\n      case "health":');
}

fs.writeFileSync('src/pages/Settings/index.tsx', code);
