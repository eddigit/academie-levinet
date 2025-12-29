// Script de génération du fichier buildInfo.js avec timestamp
// Exécuté automatiquement avant chaque build

const fs = require('fs');
const path = require('path');

const now = new Date();
const dateStr = now.toLocaleDateString('fr-FR');
const timeStr = now.toLocaleTimeString('fr-FR');
const buildId = now.getTime().toString();

const buildInfo = `// ============================================
// FICHIER GÉNÉRÉ AUTOMATIQUEMENT À CHAQUE BUILD
// NE PAS MODIFIER MANUELLEMENT
// ============================================

const BUILD_INFO = {
  timestamp: "${now.toISOString()}",
  date: "${dateStr}",
  time: "${timeStr}",
  buildId: "${buildId}",
  version: "1.0.0"
};

export default BUILD_INFO;
`;

const filePath = path.join(__dirname, 'src', 'buildInfo.js');
fs.writeFileSync(filePath, buildInfo, 'utf8');

console.log('');
console.log('================================================================');
console.log('   BUILD INFO GENERE - ACADEMIE JACQUES LEVINET');
console.log('================================================================');
console.log('   Date: ' + dateStr);
console.log('   Heure: ' + timeStr);
console.log('   Build ID: ' + buildId);
console.log('================================================================');
console.log('');
