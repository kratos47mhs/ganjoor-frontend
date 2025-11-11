import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api, GanjoorPoem, GanjoorVerse } from '@/lib/api';

interface PoemPageProps {
  params: {
    id: string;
  };
}

async function getPoem(id: string): Promise<GanjoorPoem | null> {
  try {
    return await api.poems.get(parseInt(id));
  } catch (error) {
    console.error('Error fetching poem:', error);
    return null;
  }
}

export default async function PoemPage({ params }: PoemPageProps) {
  const { id } = await params;

  // Validate ID is a positive number
  const poemId = parseInt(id);
  if (isNaN(poemId) || poemId <= 0) {
    notFound();
  }

  const poem = await getPoem(id);

  if (!poem) {
    notFound();
  }

  const getHemistichClass = (position: number) => {
    switch (position) {
      case 0: // Right (First Hemistich)
        return 'text-right';
      case 1: // Left (Second Hemistich)
        return 'text-left';
      case 2: // Centered Verse 1
        return 'text-center col-span-2';
      case 3: // Centered Verse 2
        return 'text-center col-span-2';
      case 4: // Single (Free Verse)
        return 'text-center col-span-2';
      case 5: // Comment
        return 'text-center col-span-2 text-persian-ink/60 italic';
      case -1: // Paragraph (Prose)
        return 'text-justify col-span-2';
      default:
        return 'text-right';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8 animate-slide-up">
          <Link href="/" className="nav-link persian-text">
            خانه
          </Link>
          <span className="mx-2 text-persian-ink/50">❋</span>
          <Link href={`/poets/${poem.poet_id}`} className="nav-link persian-text">
            {poem.poet_name}
          </Link>
          <span className="mx-2 text-persian-ink/50">❋</span>
          <Link href={`/categories/${poem.category}`} className="nav-link persian-text">
            {poem.category_title}
          </Link>
          <span className="mx-2 text-persian-ink/50">❋</span>
          <span className="text-persian-ink persian-text font-medium">{poem.title}</span>
        </nav>

        {/* Poem Header - Traditional Ganjoor Style */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 persian-text">
              {poem.title}
            </h1>
            <div className="text-sm text-gray-600 persian-text space-y-1">
              <p>از {poem.poet_name}</p>
              <p>{poem.category_title}</p>
              <p>{poem.verses_count} بیت</p>
            </div>
            {poem.url && (
              <div className="mt-4">
                <a
                  href={poem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 text-blue-600 hover:text-blue-800 hover:underline persian-text text-sm"
                >
                  مشاهده در گنجور اصلی
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Poem Verses - Enhanced Persian Poetry Reading Experience */}
        <div className="bg-gradient-to-br from-persian-parchment/50 to-white border border-persian-gold/20 rounded-xl p-8 md:p-12 mb-8 shadow-lg">
          {/* Reading Controls */}
          <div className="flex justify-center items-center gap-6 mb-8 p-4 bg-white/60 rounded-lg border border-persian-gold/10">
            <div className="flex items-center gap-2 text-sm persian-text text-persian-ink/70">
              <span className="text-persian-gold">📖</span>
              <span>مطالعه</span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text text-persian-ink/70">
              <span className="text-persian-turquoise">🔊</span>
              <span>شنیدن</span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text text-persian-ink/70">
              <span className="text-persian-emerald">📝</span>
              <span>یادداشت</span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text text-persian-ink/70">
              <span className="text-persian-rose">❤️</span>
              <span>پسندیدن</span>
            </div>
          </div>

          <div className="poetry-text max-w-4xl mx-auto">
            {poem.verses && poem.verses.length > 0 ? (
              <div className="space-y-6">
                {/* Decorative Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-persian-gold/10 rounded-full border border-persian-gold/20">
                    <span className="text-persian-gold text-lg">❋</span>
                    <span className="persian-text text-persian-ink font-medium">متن شعر</span>
                    <span className="text-persian-gold text-lg">❋</span>
                  </div>
                </div>

                {/* Group verses into beyts (couplets) with enhanced styling */}
                {(() => {
                  const beyts: GanjoorVerse[][] = [];
                  for (let i = 0; i < poem.verses.length; i += 2) {
                    beyts.push(poem.verses.slice(i, i + 2));
                  }
                  return beyts.map((beyt, beytIndex) => (
                    <div key={`beyt-${beytIndex}`} className="poetry-verse group">
                      {beyt.length === 2 ? (
                        // Traditional beyts (couplets) - two hemistichs with enhanced styling
                        <div className="text-xl leading-relaxed text-center transition-all duration-300 hover:text-persian-ink">
                          <span className="relative">
                            {beyt[0].text}
                            <span className="absolute -top-2 -right-2 text-persian-gold/30 text-sm opacity-0 group-hover:opacity-100 transition-opacity">۱</span>
                          </span>
                          <span className="inline-block mx-6 text-persian-gold/60 text-2xl leading-none">٭</span>
                          <span className="relative">
                            {beyt[1].text}
                            <span className="absolute -top-2 -left-2 text-persian-gold/30 text-sm opacity-0 group-hover:opacity-100 transition-opacity">۲</span>
                          </span>
                        </div>
                      ) : (
                        // Single verse (odd number of verses or special cases)
                        <div className="text-center text-xl leading-relaxed transition-all duration-300 hover:text-persian-ink">
                          {beyt[0].text}
                        </div>
                      )}

                      {/* Verse separator with Persian motif */}
                      {beytIndex < beyts.length - 1 && (
                        <div className="verse-separator my-8">
                          <span className="text-persian-gold animate-pulse">❋</span>
                        </div>
                      )}
                    </div>
                  ));
                })()}

                {/* Poem Footer */}
                <div className="text-center mt-12 pt-8 border-t border-persian-gold/20">
                  <div className="inline-flex items-center gap-4 px-6 py-3 bg-persian-gold/5 rounded-full">
                    <span className="text-persian-gold text-lg">✦</span>
                    <span className="persian-text text-persian-ink/70 text-sm">
                      پایان شعر • {poem.verses_count} بیت
                    </span>
                    <span className="text-persian-gold text-lg">✦</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mb-6">
                  <div className="text-6xl text-persian-gold/30 mb-4">❋</div>
                  <h3 className="text-2xl font-bold text-persian-ink mb-2 persian-text">
                    متنی یافت نشد
                  </h3>
                </div>
                <p className="text-persian-ink/70 persian-text text-lg leading-relaxed max-w-md mx-auto">
                  متأسفانه متن کامل این شعر در حال حاضر در دسترس نیست.
                  در آینده نزدیک متن این اثر ارزشمند اضافه خواهد شد.
                </p>
                <div className="mt-6 flex justify-center">
                  <div className="px-4 py-2 bg-persian-gold/10 rounded-lg border border-persian-gold/20">
                    <span className="text-persian-gold text-sm persian-text">به زودی...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Traditional Ganjoor Style */}
        <div className="text-center">
          <div className="space-x-6">
            <Link
              href={`/categories/${poem.category}`}
              className="text-blue-600 hover:text-blue-800 hover:underline persian-text text-sm"
            >
              بازگشت به {poem.category_title}
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href={`/poets/${poem.poet_id}`}
              className="text-blue-600 hover:text-blue-800 hover:underline persian-text text-sm"
            >
              بازگشت به {poem.poet_name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
