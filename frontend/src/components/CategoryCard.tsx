import Link from 'next/link';

interface CategoryCardProps {
  id: number;
  name: string;
  slug: string;
}

// Emoji mapping for common categories
const categoryEmojis: Record<string, string> = {
  electronics: '📱',
  mobiles: '📱',
  phones: '📱',
  laptops: '💻',
  computers: '💻',
  clothing: '👕',
  clothes: '👕',
  fashion: '👕',
  shoes: '👟',
  footwear: '👟',
  books: '📚',
  book: '📚',
  home: '🏠',
  furniture: '🛋️',
  sports: '⚽',
  sport: '⚽',
  toys: '🧸',
  beauty: '💄',
  cosmetics: '💄',
  health: '💊',
  groceries: '🛒',
  food: '🍔',
  watches: '⌚',
  jewelry: '💎',
  games: '🎮',
  gaming: '🎮',
  music: '🎵',
  cameras: '📷',
  photography: '📷',
};

function getCategoryEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Direct match
  if (categoryEmojis[lowerName]) {
    return categoryEmojis[lowerName];
  }
  
  // Partial match
  for (const [key, emoji] of Object.entries(categoryEmojis)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  
  // Default fallback
  return '🏷️';
}

// Color mapping for category backgrounds
const categoryColors = [
  'from-blue-500 to-blue-600',
  'from-violet-500 to-violet-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-cyan-500 to-cyan-600',
  'from-fuchsia-500 to-fuchsia-600',
  'from-indigo-500 to-indigo-600',
];

function getCategoryColor(index: number): string {
  return categoryColors[index % categoryColors.length];
}

export default function CategoryCard({ id, name, slug }: CategoryCardProps) {
  const emoji = getCategoryEmoji(name);
  const colorIndex = name.length % categoryColors.length;
  const gradient = getCategoryColor(colorIndex);

  return (
    <Link href={`/products?category_id=${id}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 
          transform transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-xl hover:shadow-gray-200
          active:scale-95`}
      >
        {/* Decorative circle */}
        <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute -left-4 -bottom-4 w-16 h-16 rounded-full bg-white/5" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon */}
          <div className="mb-3 text-5xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
            {emoji}
          </div>
          
          {/* Name */}
          <h3 className="text-white font-semibold text-center text-sm md:text-base tracking-wide">
            {name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
