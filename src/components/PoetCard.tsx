import Link from 'next/link';
import Image from 'next/image';
import { GanjoorPoetList } from '@/lib/api';

interface PoetCardProps {
  poet: GanjoorPoetList;
  readingMode?: 'day' | 'night';
}

export default function PoetCard({ poet, readingMode = 'day' }: PoetCardProps) {
  const getCenturyColor = (century: string) => {
    switch (century) {
      case 'ancient':
        return readingMode === 'night'
          ? 'bg-persian-crimson/80 text-persian-parchment border-persian-crimson'
          : 'bg-gradient-to-br from-persian-crimson to-persian-rose text-white border-persian-crimson';
      case 'classical':
        return readingMode === 'night'
          ? 'bg-persian-gold/80 text-persian-midnight border-persian-gold'
          : 'bg-gradient-to-br from-persian-gold to-persian-saffron text-persian-ink border-persian-gold';
      case 'contemporary':
        return readingMode === 'night'
          ? 'bg-persian-turquoise/80 text-persian-midnight border-persian-turquoise'
          : 'bg-gradient-to-br from-persian-turquoise to-persian-lapis text-white border-persian-turquoise';
      case 'modern':
        return readingMode === 'night'
          ? 'bg-persian-indigo/80 text-persian-parchment border-persian-indigo'
          : 'bg-gradient-to-br from-persian-indigo to-persian-midnight text-white border-persian-indigo';
      default:
        return readingMode === 'night'
          ? 'bg-persian-ink/80 text-persian-parchment border-persian-ink'
          : 'bg-gradient-to-br from-persian-ink to-persian-emerald text-white border-persian-ink';
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
      <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer ${
        readingMode === 'night'
          ? 'bg-persian-indigo/10 border border-persian-gold/20 hover:border-persian-gold/40'
          : 'bg-white/80 backdrop-blur-sm border border-persian-gold/20 hover:border-persian-gold/60 shadow-lg'
      }`}>

        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <div className="absolute top-2 right-2 text-persian-gold text-2xl">❋</div>
          <div className="absolute bottom-2 left-2 text-persian-turquoise text-xl">✦</div>
        </div>

        {/* Poet Image */}
        <div className="relative w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 transition-all duration-300 group-hover:border-persian-gold">
          {poet.image ? (
            <Image
              src={poet.image}
              alt={poet.name}
              width={80}
              height={80}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center transition-colors duration-300 ${
              readingMode === 'night' ? 'bg-persian-indigo/50' : 'bg-persian-parchment'
            }`}>
              <span className={`text-2xl font-bold persian-text transition-colors duration-300 ${
                readingMode === 'night' ? 'text-persian-gold' : 'text-persian-ink'
              }`}>
                {poet.name.charAt(0)}
              </span>
            </div>
          )}

          {/* Century Badge */}
          <div className={`absolute -bottom-1 -right-1 px-2 py-1 rounded-full text-xs font-medium border-2 border-white shadow-lg transition-all duration-300 ${getCenturyColor(poet.century)}`}>
            {getCenturyLabel(poet.century)}
          </div>
        </div>

        {/* Poet Name */}
        <h3 className={`text-xl font-bold text-center mb-3 persian-text transition-colors duration-300 group-hover:text-persian-gold ${
          readingMode === 'night' ? 'text-persian-parchment' : 'text-persian-ink'
        }`}>
          {poet.name}
        </h3>

        {/* Poems Count with Icon */}
        <div className={`flex items-center justify-center gap-2 text-sm persian-text transition-colors duration-300 ${
          readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'
        }`}>
          <span className="text-persian-gold">📖</span>
          <span>{poet.poems_count.toLocaleString('fa-IR')} شعر</span>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-persian-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      </div>
    </Link>
  );
}
