import Link from 'next/link';
import Image from 'next/image';
import { GanjoorPoetList } from '@/lib/api';

interface PoetCardProps {
  poet: GanjoorPoetList;
}

export default function PoetCard({ poet }: PoetCardProps) {
  const getCenturyColor = (century: string) => {
    switch (century) {
      case 'ancient':
        return 'bg-persian-crimson text-white';
      case 'classical':
        return 'bg-persian-gold text-persian-ink';
      case 'contemporary':
        return 'bg-persian-turquoise text-white';
      case 'modern':
        return 'bg-persian-indigo text-white';
      default:
        return 'bg-persian-ink text-white';
    }
  };

  const getCenturyLabel = (century: string) => {
    switch (century) {
      case 'ancient':
        return 'باستانی';
      case 'classical':
        return 'کلاسیک';
      case 'contemporary':
        return 'معاصر';
      case 'modern':
        return 'نو';
      default:
        return century;
    }
  };

  return (
    <Link href={`/poets/${poet.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer">
        {/* Poet Image */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden border border-gray-200">
          {poet.image ? (
            <Image
              src={poet.image}
              alt={poet.name}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-lg text-gray-600 font-bold persian-text">ش</span>
            </div>
          )}
        </div>

        {/* Poet Name */}
        <h3 className="text-lg font-bold text-center mb-2 text-gray-800 persian-text hover:text-blue-600 transition-colors">
          {poet.name}
        </h3>

        {/* Century */}
        <div className="text-center mb-2">
          <span className="text-sm text-gray-600 persian-text">
            {getCenturyLabel(poet.century)}
          </span>
        </div>

        {/* Poems Count */}
        <div className="text-center text-gray-500 text-sm persian-text">
          {poet.poems_count} شعر
        </div>
      </div>
    </Link>
  );
}
