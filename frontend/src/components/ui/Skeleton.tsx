import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-xl h-48 mb-4" />
      <div className="bg-gray-200 rounded h-4 mb-2 w-3/4" />
      <div className="bg-gray-200 rounded h-4 w-1/2" />
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="bg-gray-200 rounded-xl h-8 w-1/4" />
      <div className="bg-gray-200 rounded-xl h-32" />
      <div className="bg-gray-200 rounded-xl h-20" />
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="bg-gray-200 rounded-lg w-24 h-24 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="bg-gray-200 rounded h-4 w-3/4" />
            <div className="bg-gray-200 rounded h-4 w-1/2" />
            <div className="bg-gray-200 rounded h-6 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl h-32" />
        ))}
      </div>
      
      {/* Chart */}
      <div className="bg-gray-200 rounded-xl h-64" />
      
      {/* Table */}
      <div className="bg-gray-200 rounded-xl h-96" />
    </div>
  );
}
