const fs = require('fs');

let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

code = "import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';\n" + code;

code = code.replace(
  /path: '\/',\n\s*element: <ProtectedRoute \/>,/,
  "path: '/',\n    element: <ProtectedRoute />,\n    errorElement: <RouteErrorBoundary />,"
);

fs.writeFileSync('src/routes/index.tsx', code);
console.log("Patched routes to use RouteErrorBoundary");
