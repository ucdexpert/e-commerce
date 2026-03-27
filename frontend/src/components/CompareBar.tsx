'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { useCompareStore } from '@/store';
import { cn } from '@/lib/utils';

export default function CompareBar() {
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();

  if (compareItems.length === 0) {
    return null;
  }

  const handleCompareNow = () => {
    if (compareItems.length >= 2) {
      router.push('/compare');
    }
  };

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-white shadow-lg border-t border-gray-200",
      "animate-slide-up"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Products Section */}
          <div className="flex items-center gap-3 flex-1 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-fit">
              <GitCompare className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-700 whitespace-nowrap">
                Compare ({compareItems.length}/4)
              </span>
            </div>

            {/* Product Thumbnails */}
            <div className="flex items-center gap-2">
              {compareItems.map((product) => (
                <div
                  key={product.id}
                  className="relative flex-shrink-0 group"
                >
                  <div className="w-[50px] h-[50px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={50}
                        height={50}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <GitCompare className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    aria-label="Remove from compare"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Empty Slots (placeholders) */}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <div
                  key={index}
                  className="w-[50px] h-[50px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0"
                >
                  <GitCompare className="w-5 h-5 text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearCompare}
              className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear All</span>
            </button>

            <button
              onClick={handleCompareNow}
              disabled={compareItems.length < 2}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                compareItems.length >= 2
                  ? "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700 shadow-md hover:shadow-lg"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              )}
            >
              Compare Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
