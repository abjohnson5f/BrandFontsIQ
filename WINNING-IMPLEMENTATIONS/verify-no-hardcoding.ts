// Verify NO HARDCODED VALUES in clean implementations

import * as fs from 'fs';
import * as path from 'path';

function checkForHardcodedValues(filePath: string): {violations: string[], clean: boolean} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const violations: string[] = [];
  
  // Check for hardcoded company names in quotes
  const companyPattern = /'(Polaris|Aixam|Indian Motorcycle|Nike|Coca|Pepsi)[^']*'/g;
  const companyMatches = content.match(companyPattern);
  if (companyMatches) {
    companyMatches.forEach(match => {
      if (!match.includes('example') && !match.includes('test') && !match.includes('comment')) {
        violations.push(`Hardcoded company: ${match}`);
      }
    });
  }
  
  // Check for hardcoded URLs
  const urlPattern = /'[a-z]+\.(com|net|org)'/g;
  const urlMatches = content.match(urlPattern);
  if (urlMatches) {
    urlMatches.forEach(match => {
      if (!match.includes('example') && !match.includes('test')) {
        violations.push(`Hardcoded URL: ${match}`);
      }
    });
  }
  
  // Check for hardcoded font mappings
  const fontPattern = /'(Gotham SSm|Bd|Lt|Helvetica)[^']*'\s*:/g;
  const fontMatches = content.match(fontPattern);
  if (fontMatches) {
    fontMatches.forEach(match => {
      if (!match.includes('example') && !match.includes('test')) {
        violations.push(`Hardcoded font mapping: ${match}`);
      }
    });
  }
  
  // Check for hardcoded numeric values
  const numericPattern = /=\s*(0\.[0-9]+|[1-9][0-9]*\.?[0-9]*)\s*[;,]/g;
  const numericMatches = content.match(numericPattern);
  if (numericMatches) {
    numericMatches.forEach(match => {
      if (!match.includes('0.0') && !match.includes('1.0')) {
        violations.push(`Hardcoded number: ${match}`);
      }
    });
  }
  
  return {
    violations,
    clean: violations.length === 0
  };
}

console.log('Verifying Clean Implementations for Hardcoded Values');
console.log('==================================================\n');

// Check company identification
const companyFile = path.join(__dirname, 'company-identification/source-code/companyIdentification-clean.ts');
const companyCheck = checkForHardcodedValues(companyFile);

console.log('Company Identification Service:');
if (companyCheck.clean) {
  console.log('  ✅ NO HARDCODED VALUES FOUND');
} else {
  console.log('  ❌ VIOLATIONS FOUND:');
  companyCheck.violations.forEach(v => console.log(`    - ${v}`));
}

// Check font standardization
const fontFile = path.join(__dirname, 'font-standardization/source-code/fontIdentification-clean.ts');
const fontCheck = checkForHardcodedValues(fontFile);

console.log('\nFont Standardization Service:');
if (fontCheck.clean) {
  console.log('  ✅ NO HARDCODED VALUES FOUND');
} else {
  console.log('  ❌ VIOLATIONS FOUND:');
  fontCheck.violations.forEach(v => console.log(`    - ${v}`));
}

// Summary
console.log('\n=== SUMMARY ===');
if (companyCheck.clean && fontCheck.clean) {
  console.log('✅ Both implementations are CLEAN - NO HARDCODED VALUES');
  console.log('✅ All configuration injected at runtime');
  console.log('✅ Compliant with Immutable Truth #2');
} else {
  console.log('❌ HARDCODED VALUES DETECTED - MUST FIX');
}

// Show how configuration would work
console.log('\n=== Configuration Example ===');
console.log('In production, mappings would come from:');
console.log('1. Database tables (user-editable)');
console.log('2. Admin interface (business user updates)');
console.log('3. Configuration files (deployment-specific)');
console.log('4. Environment variables (API keys, settings)');
console.log('\nNEVER from hardcoded values in source code.');