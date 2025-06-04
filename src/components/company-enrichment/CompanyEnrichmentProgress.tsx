/**
 * Company Enrichment Progress Component
 * Shows real-time progress of company identification process
 */

import React from 'react';
import { ProcessingStats } from '@/lib/company-identification/types';

interface CompanyEnrichmentProgressProps {
  stats: ProcessingStats;
  isProcessing: boolean;
}

export const CompanyEnrichmentProgress: React.FC<CompanyEnrichmentProgressProps> = ({
  stats,
  isProcessing
}) => {
  const progress = stats.totalRows > 0 ? (stats.processed / stats.totalRows) * 100 : 0;
  const identificationRate = stats.processed > 0 ? (stats.identified / stats.processed) * 100 : 0;
  const cacheHitRate = stats.processed > 0 ? (stats.cached / stats.processed) * 100 : 0;
  const costPerRow = stats.processed > 0 ? stats.actualCost / stats.processed : 0;
  const projectedTotalCost = costPerRow * stats.totalRows;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Company Identification Progress</h3>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Processing: {stats.processed} / {stats.totalRows} rows</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">Identified</div>
          <div className="text-xl font-semibold">{stats.identified}</div>
          <div className="text-xs text-gray-500">{identificationRate.toFixed(1)}% success</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">From Cache</div>
          <div className="text-xl font-semibold">{stats.cached}</div>
          <div className="text-xs text-gray-500">{cacheHitRate.toFixed(1)}% hit rate</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">LLM Calls</div>
          <div className="text-xl font-semibold">{stats.llmCalls}</div>
          <div className="text-xs text-gray-500">{stats.errors} errors</div>
        </div>
        
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">Cost</div>
          <div className="text-xl font-semibold">${stats.actualCost.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Projected: ${projectedTotalCost.toFixed(2)}
          </div>
        </div>
      </div>
      
      {/* Status Message */}
      <div className="mt-4 text-sm">
        {isProcessing ? (
          <div className="flex items-center text-blue-600">
            <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing company identification...
          </div>
        ) : stats.processed > 0 ? (
          <div className="text-green-600">
            ✓ Processing complete
          </div>
        ) : (
          <div className="text-gray-500">
            Ready to process
          </div>
        )}
      </div>
    </div>
  );
};