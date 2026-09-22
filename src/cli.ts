import { readFile } from 'node:fs/promises';
import { evaluateReleaseEvent } from './release_policy.js';

async function main() {
  const raw = process.argv[2];
  const body = raw ? JSON.parse(raw) : JSON.parse(await readFile(new URL('../example-release-event.json', import.meta.url), 'utf8'));
  const decision = await evaluateReleaseEvent(body);
  console.log(JSON.stringify(decision, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
