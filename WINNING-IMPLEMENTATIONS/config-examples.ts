/**
 * Configuration Examples
 * These would come from database, API, or config files
 * NO HARDCODED VALUES IN PRODUCTION CODE
 */

// Company Identification Configuration
export const companyIdentificationConfig = {
  // These mappings would be loaded from database or admin interface
  parentSubsidiaryMap: {
    // Empty - would be populated from database
  },
  
  urlPatterns: {
    // Empty - would be populated from database
  },
  
  openAIApiKey: process.env.OPENAI_API_KEY!,
  modelName: process.env.LLM_MODEL_NAME || 'gpt-4-turbo-preview',
  maxRetries: 3,
};

// Font Standardization Configuration  
export const fontStandardizationConfig = {
  // These mappings would be loaded from database or admin interface
  standardizationMap: {
    // Empty - would be populated from database
  },
  
  weightPatterns: [
    // Would be loaded from configuration
  ],
  
  stylePatterns: [
    // Would be loaded from configuration
  ],
  
  widthPatterns: [
    // Would be loaded from configuration
  ],
};

// Example of loading from database
export async function loadCompanyConfig(db: any) {
  const subsidiaryMappings = await db.query('SELECT child_company, parent_company FROM company_relationships');
  const urlPatterns = await db.query('SELECT pattern, company FROM url_patterns');
  
  return {
    parentSubsidiaryMap: Object.fromEntries(
      subsidiaryMappings.map((r: any) => [r.child_company, r.parent_company])
    ),
    urlPatterns: Object.fromEntries(
      urlPatterns.map((r: any) => [r.pattern, r.company])
    ),
    openAIApiKey: process.env.OPENAI_API_KEY!,
  };
}

// Example of loading from JSON config file
export async function loadFontConfig(configPath: string) {
  const config = await import(configPath);
  return {
    standardizationMap: config.fontMappings || {},
    weightPatterns: config.weightPatterns || [],
    stylePatterns: config.stylePatterns || [],
    widthPatterns: config.widthPatterns || [],
  };
}