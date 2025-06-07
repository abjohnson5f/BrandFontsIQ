# Configuration Guide - Enterprise Ready

## Overview

The configuration is designed to work for ANY Fortune 2000 company without modification. It contains only universal patterns and standardizations, not company-specific data.

## Company Identification Configuration

### Current State (MVP)
```json
{
  "companyIdentification": {
    "parentSubsidiaryMap": {},
    "urlPatterns": {}
  }
}
```

### How It Works

1. **Parent Company**: Provided by user when creating dashboard (e.g., "Polaris Inc")
2. **Subsidiary Detection**: LLM identifies companies from metadata
3. **Multi-layer Relationships**: System detects dealer → brand → parent chains
4. **No Hardcoding**: No company names in configuration

### Future Patterns (Examples)

As we identify universal patterns, we might add:

```json
{
  "urlPatterns": {
    "dealer": ["dealer", "dealership", "motors", "automotive"],
    "distributor": ["wholesale", "distribution", "supply"],
    "franchise": ["franchise", "licensed", "authorized"]
  }
}
```

These would help identify relationship types, not specific companies.

## Font Standardization Configuration

### Current State
```json
{
  "fontStandardization": {
    "standardizationMap": {
      "Gotham SSm": "Gotham Screen Smart",
      "Bd": "Bold",
      "Lt": "Light",
      // ... etc
    }
  }
}
```

### How It Works

- Universal typography standardizations
- Applies to any company's fonts
- Conservative approach (preserves distinctions)
- Will grow as we encounter new patterns

## Enterprise Principles

1. **No Company Names**: Configuration never contains specific company names
2. **Universal Patterns**: Only patterns that apply across enterprises
3. **User Context**: Company-specific data comes from user input, not config
4. **Extensible**: Easy to add new patterns without breaking existing

## For Developers

When adding to configuration:
- ❌ Don't add: "polaris.com": "Polaris Inc"
- ✅ Do add: Universal patterns that help identify types of companies
- ✅ Do add: Standard typography rules that apply everywhere

The goal: Any Fortune 2000 company can use this software without touching the configuration.