const fs = require('fs');

let code = fs.readFileSync('src/routes/index.tsx', 'utf8');

code = code.replace(
  /const router = createBrowserRouter\(\[/,
  "const router = createBrowserRouter([\n  { path: '*', element: <ComingSoon />, errorElement: <RouteErrorBoundary /> },"
);

// wait, the better place to put it is on the root object, but since there are multiple roots (/login, /) we could map them or just add a catch-all.
// Actually, let's just put errorElement on the /login route as well.
code = code.replace(
  /path: '\/login',\n\s*element: <Login \/>,/,
  "path: '/login',\n    element: <Login />,\n    errorElement: <RouteErrorBoundary />,"
);

fs.writeFileSync('src/routes/index.tsx', code);
