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

        {/* Poem Verses - Traditional Persian Poetry Style */}
        <div className="bg-white border border-gray-200 rounded-lg p-8 md:p-12 mb-8">
          <div className="poetry-text max-w-4xl mx-auto">
            {poem.verses && poem.verses.length > 0 ? (
              <div className="space-y-3">
                {/* Group verses into beyts (couplets) */}
                {(() => {
                  const beyts: GanjoorVerse[][] = [];
                  for (let i = 0; i < poem.verses.length; i += 2) {
                    beyts.push(poem.verses.slice(i, i + 2));
                  }
                  return beyts.map((beyt, beytIndex) => (
                    <div key={`beyt-${beytIndex}`} className="beyt-line">
                      {beyt.length === 2 ? (
                        // Traditional beyts (couplets) - two hemistichs
                        <div className="text-lg leading-relaxed text-center">
                          {beyt[0].text}
                          <span className="inline-block mx-4 text-gray-400 text-xl"> </span>
                          {beyt[1].text}
                        </div>
                      ) : (
                        // Single verse (odd number of verses or special cases)
                        <div className="text-center text-lg leading-relaxed">
                          {beyt[0].text}
                        </div>
                      )}
                    </div>
                  ));
                })()}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-600 persian-text text-lg">متأسفانه متنی برای این شعر یافت نشد.</p>
                <p className="text-gray-500 persian-text text-sm mt-2">در آینده متن این شعر اضافه خواهد شد.</p>
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
