const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseVersion(version) {
  return version.split('.').map(Number);
}

function updateVersion(branch) {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath));
  let [major, minor, patch] = parseVersion(pkg.version);

  // Определяем тип изменения по ветке
  if (branch.includes('core/')) {
    major += 1;  // MAJOR - breaking changes
    minor = 0;
    patch = 0;
  } else if (branch.includes('feature/')) {
    minor += 1;  // MINOR - new features
    patch = 0;
  } else if (branch.includes('fix/') || branch.includes('hotfix/')) {
    patch += 1;  // PATCH - bug fixes
  }

  // Для релизных тегов (v1.0.0)
  if (branch.includes('refs/tags/v')) {
    const tagVersion = branch.split('refs/tags/v')[1];
    [major, minor, patch] = parseVersion(tagVersion);
  }

  const newVersion = `${major}.${minor}.${patch}`;
  pkg.version = newVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  return newVersion;
}

// Получаем текущую ветку из GitHub Actions или git
const branch = process.env.GITHUB_REF || execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const newVersion = updateVersion(branch);

console.log(`Updated to version: ${newVersion}`);