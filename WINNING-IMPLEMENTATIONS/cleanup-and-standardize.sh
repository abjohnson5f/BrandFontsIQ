#!/bin/bash

# Clean up and standardize WINNING-IMPLEMENTATIONS

echo "🧹 Cleaning up WINNING-IMPLEMENTATIONS directory..."
echo "================================================"

# Create archive directory for old versions
mkdir -p _ARCHIVE

# Archive old company identification versions
echo ""
echo "📦 Archiving old company identification versions..."
mv company-identification/source-code/companyIdentification.ts _ARCHIVE/ 2>/dev/null || echo "  - companyIdentification.ts already archived"
mv company-identification/source-code/companyIdentification-clean.ts _ARCHIVE/ 2>/dev/null || echo "  - companyIdentification-clean.ts already archived"
mv company-identification/source-code/companyIdentification-working.ts _ARCHIVE/ 2>/dev/null || echo "  - companyIdentification-working.ts already archived"
mv company-identification/source-code/identify-companies.ts _ARCHIVE/ 2>/dev/null || echo "  - identify-companies.ts already archived"

# Archive old font standardization versions
echo ""
echo "📦 Archiving old font standardization versions..."
mv font-standardization/source-code/fontIdentification.ts _ARCHIVE/ 2>/dev/null || echo "  - fontIdentification.ts already archived"
mv font-standardization/source-code/fontIdentification-clean.ts _ARCHIVE/ 2>/dev/null || echo "  - fontIdentification-clean.ts already archived"

# Rename enhanced versions to standard names
echo ""
echo "✅ Standardizing file names..."
mv company-identification/source-code/companyIdentification-enhanced.ts company-identification/source-code/index.ts 2>/dev/null || echo "  - Company identification already standardized"
mv font-standardization/source-code/fontIdentification-enhanced.ts font-standardization/source-code/index.ts 2>/dev/null || echo "  - Font standardization already standardized"

echo ""
echo "📝 Creating standard directory structure..."

# Create standard directories
mkdir -p company-identification/{docs,tests,examples}
mkdir -p font-standardization/{docs,tests,examples}

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Final structure:"
echo "WINNING-IMPLEMENTATIONS/"
echo "├── configuration.json"
echo "├── company-identification/"
echo "│   ├── source-code/"
echo "│   │   └── index.ts (the ONLY implementation)"
echo "│   ├── docs/"
echo "│   ├── tests/"
echo "│   └── examples/"
echo "├── font-standardization/"
echo "│   ├── source-code/"
echo "│   │   └── index.ts (the ONLY implementation)"
echo "│   ├── docs/"
echo "│   ├── tests/"
echo "│   └── examples/"
echo "└── _ARCHIVE/ (old versions - DO NOT USE)"