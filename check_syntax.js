// check_syntax.js - Validates manifest and JS files syntax

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== Canva Slide Copilot Syntax Validator ===");

let passed = true;

// 1. Validate manifest.json
try {
  const manifestPath = path.join(__dirname, 'manifest.json');
  console.log("Checking manifest.json...");
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const manifestJson = JSON.parse(manifestContent);
  
  // Verify basic MV3 fields
  if (manifestJson.manifest_version !== 3) {
    console.error("❌ manifest_version must be 3");
    passed = false;
  } else {
    console.log("✅ manifest.json parsed and verified successfully!");
  }
} catch (err) {
  console.error("❌ Error parsing manifest.json:", err.message);
  passed = false;
}

// 2. Check Javascript Files Syntax using node --check
const jsFiles = ['background.js', 'content.js', 'sidepanel.js'];
jsFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  console.log(`Checking syntax for ${file}...`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File ${file} does not exist!`);
    passed = false;
    return;
  }
  
  try {
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log(`✅ ${file} has valid JS syntax!`);
  } catch (err) {
    console.error(`❌ Syntax error in ${file}:`);
    console.error(err.stderr.toString());
    passed = false;
  }
});

// 3. Check CSS File Existence
const cssPath = path.join(__dirname, 'sidepanel.css');
console.log("Checking sidepanel.css...");
if (fs.existsSync(cssPath)) {
  console.log("✅ sidepanel.css exists!");
} else {
  console.error("❌ sidepanel.css does not exist!");
  passed = false;
}

// 4. Check Icon files
const iconSizes = ['icon16.png', 'icon48.png', 'icon128.png'];
iconSizes.forEach(icon => {
  const iconPath = path.join(__dirname, 'icons', icon);
  console.log(`Checking icon ${icon}...`);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    if (stats.size > 0) {
      console.log(`✅ ${icon} exists and is non-empty (${stats.size} bytes)`);
    } else {
      console.error(`❌ ${icon} is empty!`);
      passed = false;
    }
  } else {
    console.error(`❌ ${icon} does not exist!`);
    passed = false;
  }
});

console.log("===========================================");
if (passed) {
  console.log("🎉 SUCCESS: All extension syntax checks passed!");
  process.exit(0);
} else {
  console.error("🚨 FAILURE: One or more checks failed.");
  process.exit(1);
}
