#!/usr/bin/env npx tsx

/**
 * Review what patterns the learning system has discovered
 */

import { learningSystem } from './source-code/learning-system';

function reviewLearnedPatterns() {
  console.log('Company Identification Learning System Review');
  console.log('============================================\n');

  const stats = learningSystem.getStats();

  console.log(`Total patterns learned: ${stats.totalPatterns}`);
  console.log(`Total domain mappings: ${stats.totalDomainMappings}`);
  console.log(`Unique companies learned: ${stats.companiesLearned.size}`);
  
  if (stats.companiesLearned.size > 0) {
    console.log('\nCompanies learned:');
    Array.from(stats.companiesLearned).sort().forEach(company => {
      console.log(`  - ${company}`);
    });
  }

  if (stats.mostCommonPatterns.length > 0) {
    console.log('\nMost common patterns:');
    stats.mostCommonPatterns.forEach(({ pattern, company, occurrences }) => {
      console.log(`  - "${pattern}" → ${company} (seen ${occurrences} times)`);
    });
  }

  console.log('\nThe learning system will improve accuracy over time by:');
  console.log('1. Learning from successful identifications');
  console.log('2. Detecting and handling pattern conflicts');
  console.log('3. Avoiding overly generic patterns');
  console.log('4. Building domain-specific knowledge without hardcoding');
}

reviewLearnedPatterns();