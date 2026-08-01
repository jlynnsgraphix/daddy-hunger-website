const fs = require('fs');
const path = require('path');

const [owner, repo] = process.argv.slice(2);
if (!owner || !repo) {
  console.error('Usage: node configure-cms.js YOUR_GITHUB_USERNAME YOUR_REPOSITORY_NAME');
  process.exit(1);
}

const configPath = path.join(__dirname, 'src', 'admin', 'config.yml');
let config = fs.readFileSync(configPath, 'utf8');
config = config.replace(
  /repo:\s*(?:REPLACE_WITH_GITHUB_USERNAME\/REPLACE_WITH_REPOSITORY_NAME|[^\s]+\/[^\s]+)/,
  `repo: ${owner}/${repo}`
);
fs.writeFileSync(configPath, config, 'utf8');
console.log(`Decap CMS configured for GitHub repository: ${owner}/${repo}`);
