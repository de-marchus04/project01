const fs = require("fs"); ["ru", "en", "uk"].forEach(l => { fs.writeFileSync(`src/shared/i18n/dictionaries/${l}.ts`, `export const ${l} = {\\n};\\n`); });
