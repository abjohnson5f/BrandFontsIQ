"use strict";
/**
 * Font Identification Module - Hybrid Implementation
 *
 * Combines:
 * - Agent 1's conservative standardization (base - closest to manual count)
 * - Agent 2's component parsing (for future font anatomy enrichment)
 *
 * This approach maintains accuracy while preparing for advanced analysis.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FontIdentification = void 0;
exports.parseFontComponents = parseFontComponents;
exports.standardizeFontName = standardizeFontName;
exports.extractFontFromPath = extractFontFromPath;
exports.combineFamilySubfamily = combineFamilySubfamily;
exports.identifyUniqueFonts = identifyUniqueFonts;
exports.processExcelFile = processExcelFile;
var XLSX = __importStar(require("xlsx"));
var path = __importStar(require("path"));
// Standardization map from Agent 1 (conservative approach)
var standardizationMap = {
    // Gotham variations
    'Gotham SSm': 'Gotham Screen Smart',
    'Gotham Screen Space Smart': 'Gotham Screen Smart',
    'GothamSSm': 'Gotham Screen Smart',
    // Weight variations (DO NOT REMOVE - just standardize)
    'Bd': 'Bold',
    'Lt': 'Light',
    'Md': 'Medium',
    'Rg': 'Regular',
    'SemiBold': 'Semi-Bold',
    'Semibold': 'Semi-Bold',
};
// Font component patterns from Agent 2
var weightPattern = /\b(Ultra\s*Light|Extra\s*Light|Thin|Light|Regular|Medium|Demi\s*Bold|Semi[\s-]?Bold|Bold|Extra\s*Bold|Heavy|Black)\b/gi;
var stylePattern = /\b(Italic|Oblique|Roman)\b/gi;
var widthPattern = /\b(Condensed|Extended|Narrow|Wide)\b/gi;
/**
 * Parse font components for future anatomy analysis
 * From Agent 2 - essential for Sprint 4
 */
function parseFontComponents(fontName) {
    if (!fontName)
        return null;
    var baseName = fontName;
    var components = {
        weight: null,
        style: null,
        width: null
    };
    // Extract weight
    var weightMatch = fontName.match(weightPattern);
    if (weightMatch) {
        components.weight = weightMatch[weightMatch.length - 1]; // Take last match
        baseName = baseName.replace(weightPattern, '').trim();
    }
    // Extract style
    var styleMatch = fontName.match(stylePattern);
    if (styleMatch) {
        components.style = styleMatch[0];
        baseName = baseName.replace(stylePattern, '').trim();
    }
    // Extract width
    var widthMatch = fontName.match(widthPattern);
    if (widthMatch) {
        components.width = widthMatch[0];
        baseName = baseName.replace(widthPattern, '').trim();
    }
    // Clean up base name
    baseName = baseName.replace(/\s+/g, ' ').trim();
    return __assign({ baseName: baseName }, components);
}
/**
 * Standardize font name using Agent 1's conservative approach
 */
function standardizeFontName(fontName) {
    if (!fontName)
        return null;
    var standardized = fontName.trim();
    // Apply standardization mappings
    for (var _i = 0, _a = Object.entries(standardizationMap); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        var regex = new RegExp("\\b".concat(key, "\\b"), 'gi');
        standardized = standardized.replace(regex, value);
    }
    // Clean up extra spaces
    standardized = standardized.replace(/\s+/g, ' ').trim();
    return standardized;
}
/**
 * Extract font name from file path
 */
function extractFontFromPath(filePath) {
    if (!filePath)
        return null;
    // Extract filename without extension
    var filename = path.basename(filePath, path.extname(filePath));
    // Convert camelCase and hyphenated names to spaces
    var fontName = filename
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .trim();
    return standardizeFontName(fontName);
}
/**
 * Combine family and subfamily
 */
function combineFamilySubfamily(family, subfamily) {
    if (!family)
        return null;
    var parts = [family];
    if (subfamily && subfamily.toLowerCase() !== 'regular') {
        parts.push(subfamily);
    }
    return standardizeFontName(parts.join(' '));
}
/**
 * Main function to identify unique fonts
 */
function identifyUniqueFonts(data) {
    var uniqueFonts = new Set();
    var fontOccurrences = new Map();
    var processedRows = [];
    data.forEach(function (row, index) {
        var identifiedFont = null;
        var identificationMethod = null;
        // 1. Try Font Name column first (various possible column names)
        var fontNameColumns = ['Font Name', 'FontName', 'Name', 'Font'];
        for (var _i = 0, fontNameColumns_1 = fontNameColumns; _i < fontNameColumns_1.length; _i++) {
            var col = fontNameColumns_1[_i];
            if (row[col]) {
                identifiedFont = standardizeFontName(row[col]);
                identificationMethod = 'Font Name Column';
                break;
            }
        }
        // 2. Try file path
        var pathColumns = ['File Path', 'FilePath', 'Path', 'Font File Path'];
        if (!identifiedFont) {
            for (var _a = 0, pathColumns_1 = pathColumns; _a < pathColumns_1.length; _a++) {
                var col = pathColumns_1[_a];
                if (row[col]) {
                    identifiedFont = extractFontFromPath(row[col]);
                    if (identifiedFont) {
                        identificationMethod = 'File Path';
                        break;
                    }
                }
            }
        }
        // 3. Try other columns that might contain font info
        if (!identifiedFont) {
            var otherColumns = Object.keys(row).filter(function (col) {
                return !fontNameColumns.includes(col) &&
                    !pathColumns.includes(col) &&
                    !col.toLowerCase().includes('id') &&
                    !col.toLowerCase().includes('date');
            });
            for (var _b = 0, otherColumns_1 = otherColumns; _b < otherColumns_1.length; _b++) {
                var col = otherColumns_1[_b];
                if (row[col] && typeof row[col] === 'string') {
                    var value = row[col].trim();
                    // Check if it looks like a font name
                    if (value.length > 2 && value.length < 100 && /[A-Za-z]/.test(value)) {
                        identifiedFont = standardizeFontName(value);
                        if (identifiedFont) {
                            identificationMethod = "Other Column (".concat(col, ")");
                            break;
                        }
                    }
                }
            }
        }
        // 4. Try family + subfamily combination
        if (!identifiedFont) {
            var familyCol = Object.keys(row).find(function (col) {
                return col.toLowerCase().includes('family') && !col.toLowerCase().includes('subfamily');
            });
            var subfamilyCol = Object.keys(row).find(function (col) {
                return col.toLowerCase().includes('subfamily') || col.toLowerCase().includes('style');
            });
            if (familyCol && row[familyCol]) {
                identifiedFont = combineFamilySubfamily(row[familyCol], row[subfamilyCol]);
                if (identifiedFont) {
                    identificationMethod = 'Family + Subfamily';
                }
            }
        }
        // Default if nothing found
        if (!identifiedFont) {
            identifiedFont = 'Unknown Font';
            identificationMethod = 'Default';
        }
        // Parse components for future use
        var components = parseFontComponents(identifiedFont) || {
            baseName: identifiedFont,
            weight: null,
            style: null,
            width: null
        };
        // Add to results
        uniqueFonts.add(identifiedFont);
        fontOccurrences.set(identifiedFont, (fontOccurrences.get(identifiedFont) || 0) + 1);
        processedRows.push({
            fontName: identifiedFont,
            components: components,
            identificationMethod: identificationMethod || 'Unknown',
            rowIndex: index
        });
    });
    return {
        uniqueFonts: uniqueFonts,
        fontOccurrences: fontOccurrences,
        processedRows: processedRows,
        totalRows: data.length,
        uniqueCount: uniqueFonts.size
    };
}
/**
 * Process Excel file and return unique fonts summary
 */
function processExcelFile(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var workbook, sheetName, worksheet, data;
        return __generator(this, function (_a) {
            workbook = XLSX.readFile(filePath);
            sheetName = workbook.SheetNames[0];
            worksheet = workbook.Sheets[sheetName];
            data = XLSX.utils.sheet_to_json(worksheet);
            return [2 /*return*/, identifyUniqueFonts(data)];
        });
    });
}
/**
 * Export functions for testing and future sprints
 */
exports.FontIdentification = {
    processExcelFile: processExcelFile,
    identifyUniqueFonts: identifyUniqueFonts,
    parseFontComponents: parseFontComponents,
    standardizeFontName: standardizeFontName,
    extractFontFromPath: extractFontFromPath,
    combineFamilySubfamily: combineFamilySubfamily
};
