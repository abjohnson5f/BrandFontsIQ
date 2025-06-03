# UI Components Guide

## 🎯 Purpose
React components for BrandFontsIQ dashboard interfaces.

## 🔑 Component Principles

### 1. Data Isolation
```tsx
// ❌ NEVER: Cross-dashboard data
const AllCompanyView = () => { /* NO! */ };

// ✅ ALWAYS: Single dashboard scope
const DashboardView = ({ dashboardId }: Props) => {
  // Only this dashboard's data
};
```

### 2. No Hardcoded Values
```tsx
// ❌ NEVER DO THIS
<MetricCard value={500000000} label="Revenue" />

// ✅ DO THIS
<MetricCard value={metrics.revenue} label="Revenue" source="calculation" />
```

### 3. Calculation Transparency
Every metric display MUST show:
- The value
- How it was calculated (on hover/click)
- Data source attribution

## 📁 Component Structure
```
/src/components/
├── ui/               # Shadcn base components
├── features/
│   ├── FontList/    # Font display & management
│   ├── Metrics/     # KPI displays
│   ├── Import/      # Excel upload flow
│   └── Export/      # Report generation
└── layouts/
    └── Dashboard/   # Main dashboard wrapper
```

## 🎨 UI Patterns

### Metric Display
- Always show calculation method
- Include confidence indicators
- Enable drill-down to source data

### Font Display
- Show standardized AND original names
- Highlight weight/style clearly
- Group by family intelligently

## 🚀 Current Sprint UI
- Font count validator UI
- Import progress indicator
- Success/failure states (binary)

---
*components/ Directory Guide*