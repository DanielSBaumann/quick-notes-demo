#!/usr/bin/env node

const apiEndpoint = process.env.API_ENDPOINT || 'http://localhost:3000';
const sessionId = `test-${Date.now()}`;

const tests = [
  {
    name: 'Health check',
    method: 'GET',
    path: '/health',
    expectedStatus: 200
  },
  {
    name: 'Create note',
    method: 'POST',
    path: '/notes',
    body: { title: 'Smoke Test', content: 'This is a smoke test' },
    expectedStatus: 201
  },
  {
    name: 'Get notes',
    method: 'GET',
    path: '/notes',
    expectedStatus: 200
  },
  {
    name: 'Invalid note (empty title)',
    method: 'POST',
    path: '/notes',
    body: { title: '', content: 'Content' },
    expectedStatus: 400
  }
];

async function runTests() {
  console.log(`🧪 Running smoke tests against ${apiEndpoint}\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const url = `${apiEndpoint}${test.path}`;
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionId
        }
      };

      if (test.body) {
        options.body = JSON.stringify(test.body);
      }

      const response = await fetch(url, options);
      const data = await response.json().catch(() => null);

      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} (${test.method} ${test.path})`);
        passed++;
      } else {
        console.log(
          `❌ ${test.name} (${test.method} ${test.path})\n` +
          `   Expected: ${test.expectedStatus}, Got: ${response.status}`
        );
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
