# BrandFontsIQ Key Calculations

BrandFontsIQ employs research-backed calculation methodologies to quantify the business impact of typography decisions. This document details the key calculations that power the platform's insights.

## 1. Risk Analysis Calculations

The risk analysis calculations identify potential vulnerabilities in font implementation:

### External Hosting Dependency
```typescript
const externalFonts = fontData.filter((font) => font.hostingType === "external");
const externalHostingDependency = Math.round((externalFonts.length / fontData.length) * 100) || 0;

```### Font Format Inconsistency
