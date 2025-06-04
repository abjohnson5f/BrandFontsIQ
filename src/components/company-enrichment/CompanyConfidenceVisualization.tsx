/**
 * Company Confidence Visualization
 * Shows confidence distribution for company identifications
 */

import React from 'react';
import { CompanyIdentificationResult } from '@/lib/company-identification/types';

interface CompanyConfidenceVisualizationProps {
  results: CompanyIdentificationResult[];
}

export const CompanyConfidenceVisualization: React.FC<CompanyConfidenceVisualizationProps> = ({
  results
}) => {
  // Calculate confidence distribution
  const distribution = {
    high: results.filter(r => r.confidence >= 85).length,
    medium: results.filter(r => r.confidence >= 70 && r.confidence < 85).length,
    low: results.filter(r => r.confidence < 70).length
  };
  
  const total = results.length || 1;
  
  // Get top uncertain results for review
  const uncertainResults = results
    .filter(r => r.confidence < 70 || r.needsReview)
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 5);
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Confidence Distribution</h3>
      
      {/* Confidence Bars */}
      <div className="space-y-3 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">High Confidence (≥85%)</span>
            <span className="font-medium">{distribution.high}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className="bg-green-500 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ width: `${(distribution.high / total) * 100}%` }}
            >
              {((distribution.high / total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Medium Confidence (70-84%)</span>
            <span className="font-medium">{distribution.medium}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className="bg-yellow-500 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ width: `${(distribution.medium / total) * 100}%` }}
            >
              {((distribution.medium / total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Low Confidence (&lt;70%)</span>
            <span className="font-medium">{distribution.low}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6">
            <div 
              className="bg-red-500 h-6 rounded-full flex items-center justify-center text-white text-xs"
              style={{ width: `${(distribution.low / total) * 100}%` }}
            >
              {((distribution.low / total) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
      
      {/* Items Needing Review */}
      {uncertainResults.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Items Needing Review</h4>
          <div className="space-y-2">
            {uncertainResults.map((result, idx) => (
              <div key={idx} className="bg-red-50 rounded p-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">{result.company}</span>
                  <span className="text-red-600">{result.confidence}% confidence</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {result.evidence[0]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};