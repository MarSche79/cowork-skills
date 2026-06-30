#!/usr/bin/env node
/**
 * call-model.js — minimal Azure AI Foundry / Azure OpenAI chat client.
 *
 * Auth: uses `az account get-access-token` (no API keys stored on disk).
 * Endpoint + deployment come from config.json.
 *
 * Usage:
 *   node call-model.js --role creativeDirector --system "..." --user "..."
 *   node call-model.js --deployment gpt-4.1 --user "Hello"
 *   echo "Hello" | node call-model.js --role producer --system "Be terse."
 *
 * Output: prints the assistant message text to stdout. Errors to stderr,
 *         non-zero exit on failure.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const CONFIG_PATH = path.join(__dirname, 'config.json');

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Missing config at ${CONFIG_PATH}. Copy config.sample.json and fill it in.`);
  }
  const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  if (!cfg.azureFoundry?.endpoint) throw new Error('config.azureFoundry.endpoint is required');
  return cfg;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      args[key] = val;
      i++;
    }
  }
  return args;
}

function getToken() {
  if (process.platform === 'win32') {
    const out = execFileSync(
      'az.cmd account get-access-token --resource https://cognitiveservices.azure.com -o json',
      { encoding: 'utf8', shell: true }
    );
    return JSON.parse(out).accessToken;
  }
  const out = execFileSync('az', [
    'account', 'get-access-token',
    '--resource', 'https://cognitiveservices.azure.com',
    '-o', 'json'
  ], { encoding: 'utf8' });
  return JSON.parse(out).accessToken;
}

function resolveDeployment(cfg, role, explicit) {
  if (explicit) return explicit;
  if (!role) throw new Error('Provide --role or --deployment');
  const dep = cfg.designTeamModels?.[role];
  if (!dep) {
    const fb = cfg.fallbacks?.[role];
    if (!fb) throw new Error(`No deployment configured for role "${role}"`);
    process.stderr.write(`[call-model] Role "${role}" missing primary; using fallback "${fb}"\n`);
    return fb;
  }
  return dep;
}

async function chat({ endpoint, apiVersion, deployment, token, messages, maxTokens, temperature }) {
  const url = `${endpoint.replace(/\/$/, '')}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${apiVersion}`;
  const body = { messages };
  if (maxTokens != null) body.max_completion_tokens = maxTokens;
  if (temperature != null) body.temperature = temperature;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${deployment}: ${text.slice(0, 600)}`);
  }
  const data = JSON.parse(text);
  return data.choices?.[0]?.message?.content ?? '';
}

async function readStdin() {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve) => {
    let buf = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => (buf += c));
    process.stdin.on('end', () => resolve(buf));
  });
}

(async () => {
  try {
    const args = parseArgs(process.argv);
    const cfg = loadConfig();
    const stdinUser = await readStdin();
    const userMsg = args.user ?? stdinUser;
    if (!userMsg || !userMsg.trim()) throw new Error('No user message (pass --user or pipe via stdin).');

    const deployment = resolveDeployment(cfg, args.role, args.deployment);
    const messages = [];
    if (args.system) messages.push({ role: 'system', content: args.system });
    messages.push({ role: 'user', content: userMsg });

    const token = getToken();
    const reply = await chat({
      endpoint: cfg.azureFoundry.endpoint,
      apiVersion: cfg.azureFoundry.apiVersion || '2024-10-21',
      deployment,
      token,
      messages,
      maxTokens: args['max-tokens'] ? parseInt(args['max-tokens'], 10) : undefined,
      temperature: args.temperature != null ? parseFloat(args.temperature) : undefined
    });
    process.stdout.write(reply);
  } catch (err) {
    process.stderr.write(`[call-model] ERROR: ${err.message}\n`);
    process.exit(1);
  }
})();


