# BrandFontsIQ Technical Architecture

## 🏗️ System Architecture

### Dashboard-as-Universe Model
```
┌─────────────────────────────────────────────┐
│           BrandFontsIQ Platform             │
├─────────────────┬─────────────────┬─────────┤
│   Dashboard 1   │   Dashboard 2   │   ...   │
│  (Company A)    │  (Company B)    │         │
│                 │                 │         │
│ • Isolated DB   │ • Isolated DB   │         │
│ • Own metrics   │ • Own metrics   │         │
│ • No sharing    │ • No sharing    │         │
└─────────────────┴─────────────────┴─────────┘
```

**Key Principles:**
- Complete data isolation per dashboard
- No cross-tenant data access
- Each dashboard = separate universe
- Shared code, isolated data

## 🧮 Calculation Engine Architecture

### Core Design Patterns

#### 1. Single Source of Truth
```typescript
// Good: Centralized calculation
class FontMetricsCalculator {
  private readonly dataSource: FontDataSource;
  
  calculateMetric(metricType: MetricType): MetricResult {
    const rawData = this.dataSource.getRawData();
    return this.compute(metricType, rawData);
  }
}

// Bad: Distributed calculations
// NEVER: Hardcoded values in components
```

#### 2. Forensic Attribution
```typescript
interface CalculationResult {
  value: number;
  formula: string;
  inputs: Record<string, any>;
  timestamp: Date;
  traceId: string;
}
```

#### 3. Pattern-Based Solutions
```typescript
// Font patterns, not hardcoded lists
const WEIGHT_PATTERNS = {
  light: /\b(light|thin|hairline)\b/i,
  regular: /\b(regular|normal|book)\b/i,
  bold: /\b(bold|heavy|black)\b/i
};
```

## 📊 Data Model

### Font Entity
```typescript
interface Font {
  id: string;                    // Unique identifier
  originalName: string;          // As found in data
  standardizedName: string;      // Cleaned name
  family: string;                // Font family
  weight: FontWeight;            // Extracted weight
  style: FontStyle;              // Regular, Italic, etc.
  source: {
    remarks?: string;            // From Remarks column
    uniqueId?: string;           // From Unique ID column
  };
  companyId?: string;            // LLM-identified
  metadata: Record<string, any>; // Extensible
}
```

### Key Relationships
```
Font (N) <-> (1) Company
Font (N) <-> (N) Document
Font (1) <-> (N) Usage Metrics
Dashboard (1) <-> (N) Fonts
```

## 🔧 Technology Stack

### Core
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Clerk
- **Styling**: Tailwind CSS

### Libraries
- **Data Processing**: 
  - xlsx for Excel parsing
  - Sharp for image processing
  - Zod for validation
  
- **AI/LLM Integration**:
  - OpenAI API for company identification
  - Structured outputs for consistency

### Infrastructure
- **Deployment**: Vercel
- **Database**: Neon (PostgreSQL)
- **File Storage**: Vercel Blob
- **Monitoring**: Sentry

## 🚀 Performance Requirements

### Scale Targets
- **Rows**: 25,000+ per import
- **Fonts**: 1,000+ unique per company
- **Response Time**: <3s for calculations
- **Import Time**: <30s for 25k rows

### Optimization Strategies
1. **Batch Processing**: Process fonts in chunks
2. **Caching**: Redis for calculation results
3. **Indexing**: On standardizedName, companyId
4. **Lazy Loading**: Progressive enhancement

## 🔒 Security Architecture

### Data Isolation
```typescript
// Middleware enforces tenant isolation
export async function middleware(req: NextRequest) {
  const dashboardId = getDashboardFromUrl(req.url);
  const userDashboards = await getUserDashboards(req);
  
  if (!userDashboards.includes(dashboardId)) {
    return new Response('Unauthorized', { status: 403 });
  }
}
```

### API Security
- Row-level security (RLS) in database
- API keys per dashboard
- Rate limiting per tenant
- Audit logging for all operations

## 📁 Project Structure
```
/src
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Shadcn components
│   └── features/         # Feature components
├── lib/                  # Core business logic
│   ├── calculations/     # Calculation engine
│   ├── fonts/           # Font processing
│   └── validation/      # Data validation
├── db/                  # Database schemas
└── types/               # TypeScript types
```

## 🧪 Testing Strategy

### Test Pyramid
```
        /\
       /  \    E2E Tests (10%)
      /----\   - Critical paths
     /      \  Integration Tests (30%)
    /--------\ - API endpoints, DB
   /          \Unit Tests (60%)
  /____________\- Business logic
```

### Critical Test Cases
1. Font count accuracy (MUST be exact)
2. Data isolation between dashboards
3. Calculation transparency
4. Import performance at scale

## 🔄 Development Workflow

### Multi-Agent Pattern
```bash
# Initialize parallel development
/simple-init-parallel feature-name

# Execute parallel implementation
/exe-parallel spec-file.md 3

# Each agent works independently
# Results merged via git
```

### CI/CD Pipeline
1. Pre-commit: Type checking, linting
2. PR: Unit tests, integration tests
3. Staging: E2E tests, performance tests
4. Production: Canary deployment

## 🎯 Current Technical Priorities

1. **Font Standardization Algorithm**
   - Regex-based weight/style extraction
   - Fuzzy matching for families
   - Performance at 25k+ scale

2. **LLM Integration for Company ID**
   - Structured output format
   - Caching strategy
   - Fallback mechanisms

3. **Calculation Engine v1**
   - Transparent formulas
   - Real-time updates
   - Export capabilities

## 🚫 Technical Anti-Patterns

1. **NEVER hardcode values** in calculations
2. **NEVER share data** between dashboards  
3. **NEVER trust** unvalidated input
4. **NEVER skip** the staging environment
5. **NEVER merge** without tests passing

---
*Technical Architecture Guide*
*Last Updated: 2025-06-02*