import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist");
const outputFile = path.join(distDir, "index.html");

await mkdir(distDir, { recursive: true });
await writeFile(
  outputFile,
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Photorido Admin</title>
  </head>
  <body>
    <main>
      <h1>Photorido Admin Placeholder</h1>
      <p>The admin dashboard scaffold is ready for future implementation.</p>
    </main>
  </body>
</html>
`,
);

console.log("Built the admin placeholder artifact.");
