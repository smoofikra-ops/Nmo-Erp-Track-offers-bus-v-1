const fs = require('fs');

let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

code = code.replace(
  "export type UserRole = 'ADMIN' | 'USER';",
  "export type UserRole = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SALES_SUPERVISOR' | 'SALES_REPRESENTATIVE' | 'USER';"
);

// We need to add the other mock users for testing purposes.
const mockLoginRegex = /if \(email === 'admin@erp\.com' && password === 'admin'\) \{[\s\S]*?\} else \{/;

const newMockLogins = `
    if (email === 'admin@erp.com' && password === 'admin') {
      const newUser: User = {
        id: '1',
        name: 'Admin User',
        email,
        role: 'ADMIN',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else if (email === 'rep@erp.com' && password === 'rep') {
      const newUser: User = {
        id: '2',
        name: 'Sales Rep',
        email,
        role: 'SALES_REPRESENTATIVE',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else if (email === 'acc@erp.com' && password === 'acc') {
      const newUser: User = {
        id: '3',
        name: 'Accountant User',
        email,
        role: 'ACCOUNTANT',
        companies: [{ id: 'COM-0001', name: 'NmoLabs' }],
        currentCompanyId: 'COM-0001',
      };
      setUser(newUser);
      localStorage.setItem('erp_user', JSON.stringify(newUser));
    } else {
`;

code = code.replace(mockLoginRegex, newMockLogins);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
console.log("Patched AuthContext.tsx");
