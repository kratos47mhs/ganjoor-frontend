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
      <div className="persian-card group cursor-pointer p-6 hover:scale-105 transition-transform duration-300">
        {/* Poet Image */}
        <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2" style={{borderColor: 'rgb(212 175 55 / 0.3)'}}>
          {poet.image ? (
            <Image
              src={poet.image}
              alt={poet.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, rgb(212 175 55 / 0.2), rgb(46 52 64 / 0.2))'}}>
              <span className="text-2xl text-persian-ink">ش</span>
            </div>
          )}
        </div>

        {/* Poet Name */}
        <h3 className="text-xl font-bold text-center mb-2 text-persian-ink group-hover:text-persian-gold transition-colors">
          {poet.name}
        </h3>

        {/* Century Badge */}
        <div className="flex justify-center mb-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCenturyColor(poet.century)}`}>
            {getCenturyLabel(poet.century)}
          </span>
        </div>

        {/* Poems Count */}
        <div className="text-center text-persian-ink/70">
          <span className="text-sm">
            {poet.poems_count} شعر
          </span>
        </div>

        {/* Decorative Element */}
        <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-40 transition-opacity">
          <div className="w-8 h-8 border-2 rounded-full" style={{borderColor: 'rgb(212 175 55 / 0.3)'}}></div>
        </div>
      </div>
    </Link>
  );
}
