import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";

function ensureTestEnv() {
  process.env.NODE_ENV ??= "test";
  process.env.PORT ??= "5001";
  process.env.API_PREFIX ??= "/api";
  process.env.MONGODB_URI ??= "mongodb://127.0.0.1:27017/photorido-test";
  process.env.FRONTEND_URL ??= "http://localhost:3000";
  process.env.JWT_ACCESS_SECRET ??= "test-access-secret-with-at-least-32-characters";
  process.env.JWT_REFRESH_SECRET ??= "test-refresh-secret-with-at-least-32-characters";
}

async function withTestServer(assertions: (baseUrl: string) => Promise<void>) {
  ensureTestEnv();

  const { createApp } = await import("./app.js");
  const server = createServer(createApp());

  await new Promise<void>((resolve, reject) => {
    server.listen(0, () => resolve());
    server.once("error", reject);
  });

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    await assertions(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

async function testRootRoute() {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/`);
    const payload = (await response.json()) as {
      success: boolean;
      message: string;
    };

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.message, "Photorido backend server is running.");
  });
}

async function testHealthRoute() {
  await withTestServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/health`);
    const payload = (await response.json()) as {
      success: boolean;
      data: {
        database: string;
        timestamp: string;
      };
    };

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.equal(payload.data.database, "disconnected");
    assert.ok(payload.data.timestamp);
  });
}

async function run() {
  await testRootRoute();
  await testHealthRoute();
  console.log("Backend smoke tests passed.");
}

run().catch((error: unknown) => {
  console.error("Backend smoke tests failed.", error);
  process.exit(1);
});
