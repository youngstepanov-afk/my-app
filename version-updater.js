const fs = require('fs');
const path = require('path');

// Получаем текущую ветку из переменных окружения Git
const branch = process.env.GITHUB_REF || '';

function updateVersion(branch) {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = require(pkgPath);
  let [major, minor, patch] = pkg.version.split('.').map(Number);

  if (branch.includes('feature/')) {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (branch.includes('fix/')) {
    minor += 1;
    patch = 0;
  } else if (branch.includes('core/')) {
    patch += 1;
  }

  pkg.version = `${major}.${minor}.${patch}`;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  
  return pkg.version;
}

const newVersion = updateVersion(branch);
console.log(`Version updated to: ${newVersion}`);