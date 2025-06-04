/**
 * Test Company Identification Script
 * Runs company identification on the Polaris test data
 */

import { CompanyIdentifier } from '../src/lib/company-identification/company-identifier';
import { MockLLMProvider, OpenAIProvider } from '../src/lib/llm-enrichment/llm-client';
import { CompanyMappings } from '../src/lib/company-identification/company-mappings';
import path from 'path';

// Add Polaris-specific mappings
function addPolarisSpecificMappings() {
  // Add AIXAM mapping
  CompanyMappings.addCustomMapping(
    'AIXAM Group',
    'AIXAM',
    {
      domains: ['100-permis.com', 'aixam.com', '*.aixam.com'],
      keywords: ['aixam', '100 licenses', '100 permis']
    }
  );
  
  // Add more specific mappings based on the test data
  CompanyMappings.addCustomMapping(
    'FW Indian',
    'FW Indian',
    {
      domains: ['fwindian.com', '*.fwindian.com'],
      keywords: ['fw indian']
    }
  );
}

async function runTest() {
  console.log('=== Company Identification Test ===\n');
  
  // Add custom mappings
  addPolarisSpecificMappings();
  
  // Use mock provider for testing (replace with OpenAI for real test)
  const useMockProvider = process.env.USE_OPENAI !== 'true';
  
  const provider = useMockProvider 
    ? new MockLLMProvider()
    : new OpenAIProvider(process.env.OPENAI_API_KEY || '', 'gpt-3.5-turbo');
  
  if (!useMockProvider && !process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable not set');
    console.log('Using mock provider instead...\n');
  }
  
  // Initialize identifier
  const identifier = new CompanyIdentifier(provider, {
    batchSize: 50,
    maxConcurrent: 5,
    enableCache: true,
    llmProvider: 'openai',
    maxCostLimit: 10 // Low limit for testing
  });
  
  await identifier.initialize();
  
  // File paths
  const inputPath = '/Users/alexjohnson/Dev Projects/Supporting Materials/Polaris Raw Test Data_CompanyID_Test.xlsx';
  const outputPath = path.join(process.cwd(), 'output', 'Polaris_CompanyID_Enriched.xlsx');
  const reportPath = path.join(process.cwd(), 'output', 'company-identification-report.json');
  
  console.log(`Input file: ${inputPath}`);
  console.log(`Output will be saved to: ${outputPath}\n`);
  
  // Process the file
  let lastStats: any = null;
  
  try {
    const finalStats = await identifier.processExcelFile(inputPath, {
      outputPath,
      onProgress: (stats) => {
        // Update progress every 10%
        if (!lastStats || stats.processed - lastStats.processed >= stats.totalRows * 0.1) {
          console.log(`Progress: ${stats.processed}/${stats.totalRows} rows (${((stats.processed / stats.totalRows) * 100).toFixed(1)}%)`);
          console.log(`  - Identified: ${stats.identified} (${((stats.identified / stats.processed) * 100).toFixed(1)}%)`);
          console.log(`  - From cache: ${stats.cached}`);
          console.log(`  - LLM calls: ${stats.llmCalls}`);
          console.log(`  - Current cost: $${stats.actualCost.toFixed(2)}\n`);
          lastStats = stats;
        }
      }
    });
    
    // Print final results
    console.log('\n=== Final Results ===');
    console.log(`Total rows processed: ${finalStats.processed}`);
    console.log(`Successfully identified: ${finalStats.identified} (${((finalStats.identified / finalStats.processed) * 100).toFixed(1)}%)`);
    console.log(`Cache hits: ${finalStats.cached} (${((finalStats.cached / finalStats.processed) * 100).toFixed(1)}%)`);
    console.log(`LLM API calls: ${finalStats.llmCalls}`);
    console.log(`Errors: ${finalStats.errors}`);
    console.log(`Total cost: $${finalStats.actualCost.toFixed(2)}`);
    console.log(`Cost per row: $${(finalStats.actualCost / finalStats.processed).toFixed(4)}`);
    console.log(`Projected cost for 25k rows: $${((finalStats.actualCost / finalStats.processed) * 25000).toFixed(2)}`);
    
    // Export detailed report
    await identifier.exportReport(reportPath);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('Error during processing:', error);
  }
}

// Run the test
runTest().catch(console.error);