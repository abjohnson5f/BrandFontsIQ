# BrandFontsIQ Key Calculations

BrandFontsIQ employs research-backed calculation methodologies to quantify the business impact of typography decisions. This document details the key calculations that power the platform's insights.

## 1. Risk Analysis Calculations

The risk analysis calculations identify potential vulnerabilities in font implementation:

### External Hosting Dependency
```typescript
const externalFonts = fontData.filter((font) => font.hostingType === "external");
const externalHostingDependency = Math.round((externalFonts.length / fontData.length) * 100) || 0;
```
### Font Format Inconsistency
```typescript
const fontsByName = new Map<string, Set<string>>();
fontData.forEach((font) => {
  if (!fontsByName.has(font.name)) {
    fontsByName.set(font.name, new Set());
  }
  fontsByName.get(font.name)!.add(font.format);
});

const inconsistentFonts = Array.from(fontsByName.values()).filter((formats) => formats.size > 1).length;
const inconsistentFontFormats = fontsByName.size > 0 ? Math.round((inconsistentFonts / fontsByName.size) * 100) : 0;
```
### Licensing Verification
```typescript
const unverifiedFonts = fontData.filter((font) => !font.licenseVerified);
const licenseVerificationNeeded = Math.round((unverifiedFonts.length / fontData.length) * 100) || 0;
```
## 2. Performance Impact Calculations

### Page Speed Improvement
```typescript
export function calculatePotentialSpeedImprovement(
  externalPercentage: number,
  avgFontSize: number,
  nonOptimalFormatPercentage: number
): number {
  // External hosting impact: 0.05-0.15s depending on percentage
  const externalHostingImpact = (externalPercentage / 100) * 0.15;

  // Format optimization impact: 0.02-0.1s depending on current formats
  const formatOptimizationImpact = (nonOptimalFormatPercentage / 100) * 0.1;

  // Size impact: 0.02-0.05s depending on average font size
  const sizeImpact = Math.min(avgFontSize / 500, 0.05);

  return externalHostingImpact + formatOptimizationImpact + sizeImpact;
}
``` 
### Conversion Rate Impact
```typescript
export function calculateBaseConversionImpact(pageSpeedImprovement: number): number {
  // Use Google/SOASTA research: 0.1s = 0.84% conversion improvement
  const rawImpact = (pageSpeedImprovement / 0.1) * 0.84;

  // Apply diminishing returns factor
  const diminishingFactor = Math.pow(0.9, Math.floor(pageSpeedImprovement / 0.1));

  // Apply real-world adjustment factor
  const realWorldFactor = 0.5;

  // Apply absolute caps for realism
  return Math.min(rawImpact * diminishingFactor * realWorldFactor, 0.5);
}
```
## 3. Font Distribution Calculations
```typescript
function calculateFontDistribution(fontData: FontData[]): FontDistribution {
  // Group fonts by environment
  const webFonts = fontData.filter((font) => font.environment === "web");
  const mobileFonts = fontData.filter((font) => font.environment === "mobile");
  
  // Calculate distributions
  const totalFonts = fontData.length;
  const webPercentage = Math.round((webFonts.length / totalFonts) * 100);
  const mobilePercentage = Math.round((mobileFonts.length / totalFonts) * 100);
  
  // Identify top fonts by usage
  const webFontCounts = countFontOccurrences(webFonts);
  const webTopFonts = generateTopFonts(webFontCounts, webFonts.length);
  const mobileFontCounts = countFontOccurrences(mobileFonts);
  const mobileTopFonts = generateTopFonts(mobileFontCounts, mobileFonts.length);
  
  return {
    web: {
      percentage: webPercentage,
      totalFonts: webFonts.length,
      uniqueFonts: new Set(webFonts.map((f) => f.name)).size,
      topFonts: webTopFonts.slice(0, 3), // Top 3 fonts
    },
    mobile: {
      percentage: mobilePercentage,
      totalFonts: mobileFonts.length,
      uniqueFonts: new Set(mobileFonts.map((f) => f.name)).size,
      topFonts: mobileTopFonts.slice(0, 3), // Top 3 fonts
    },
    // Additional environments...
  };
}
```
## 4. Research-Based Methodologies

BrandFontsIQ calculations are based on established research:

1. Google/SOASTA Research: Establishes that every 0.1s improvement in page load time can increase conversion rates by up to 0.84%
2. HTTP Archive Web Almanac: Provides baseline data on font loading impact across the web
3. Neurons Inc. Study with Monotype: Demonstrates that font choice can improve positive brand perception by up to 13%
4. Harvard Business Review: Shows that emotionally connected customers are 52% more valuable than highly satisfied customers

These research foundations ensure that BrandFontsIQ provides realistic, conservative estimates of business impact rather than speculative projections.
