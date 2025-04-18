# BrandFontsIQ Data Model (Proposed)

## Overview

This document outlines the proposed data model for BrandFontsIQ. This model is currently in development and subject to change as requirements evolve.

## Core Data Entities

### Font Data

The foundational data structure for font assets:

```typescript
// Preliminary structure - subject to refinement
interface FontData {
  id: string;                  // Unique identifier
  name: string;                // Font name
  family?: string;             // Font family
  format: string;              // File format (woff2, woff, ttf, etc.)
  size: number;                // File size in KB
  environment: string;         // Web, mobile, print, etc.
  hostingType: string;         // Self-hosted, CDN, external service
  licenseVerified: boolean;    // License compliance status
  usageCount: number;          // Estimated usage frequency
  dateAdded?: string;          // When added to inventory
  issues?: {                   // Potential problems
    type: string;
    description: string;
    severity?: "high" | "medium" | "low";
  }[];
}
```
## Client Metrics
Business metrics needed for ROI calculations:

```typescript
// Initial model - to be refined based on research
interface ClientMetrics {
  annualRevenue: number;           // Total annual revenue
  digitalRevenue: number;          // Revenue from digital channels
  monthlyPageViews: number;        // Website traffic volume
  conversionRate: number;          // Current conversion rate
  averageOrderValue: number;       // Average order value
  customerLifetimeValue: number;   // CLV metric
}
```

## Business Impact Metrics
Metrics for quantifying business impact:

```typescript
// Preliminary model for business impact calculations
interface BusinessImpact {
  performanceImprovement: {
    pageLoadTime: number;          // Seconds improved
    conversionImpact: number;      // Percentage improvement
    revenueImpact: number;         // Annual revenue impact
  };
  operationalEfficiency: {
    designTimeSavings: number;     // Hours saved
    developmentTimeSavings: number;// Hours saved
    annualCostSavings: number;     // Total savings
  };
  riskReduction: {
    complianceImprovement: number; // Percentage improvement
    riskMitigationValue: number;   // Financial value
  };
}
```

## Data Relationships
The planned relationships between data entities:

1. Companies will have many Font assets
2. Analysis results will reference Companies and Fonts
3. Business Impact calculations will be linked to specific Analyses

## Data Collection Approach
The initial approach for gathering font data will include:

- Manual inventory collection through spreadsheet uploads
- Future API integrations with font management systems
- Planned automated scanning capabilities

*Note: This data model is preliminary and will evolve during development based on user feedback and technical requirements.*
