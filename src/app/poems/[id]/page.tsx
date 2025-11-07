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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="nav-link persian-text">
            خانه
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          <Link href={`/poets/${poem.poet_id}`} className="nav-link persian-text">
            {poem.poet_name}
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          <Link href={`/categories/${poem.category}`} className="nav-link persian-text">
            {poem.category_title}
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          <span className="text-persian-ink persian-text">{poem.title}</span>
        </nav>

        {/* Poem Header */}
        <div className="persian-card p-8 mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-persian-ink mb-4 persian-text">
              {poem.title}
            </h1>
            <div className="flex justify-center items-center gap-4 text-sm text-persian-ink/70 persian-text">
              <span>از {poem.poet_name}</span>
              <span>•</span>
              <span>{poem.category_title}</span>
              <span>•</span>
              <span>{poem.verses_count} بیت</span>
            </div>
            {poem.url && (
              <a
                href={poem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-persian-gold text-persian-ink rounded-lg hover:bg-persian-gold transition-colors persian-text"
                style={{backgroundColor: 'rgb(212 175 55 / 0.8)'}}
              >
                مشاهده در گنجور
              </a>
            )}
          </div>
        </div>

        {/* Poem Verses */}
        <div className="persian-card p-8 mb-8">
          <div className="poetry-text text-persian-ink leading-loose">
            {poem.verses && poem.verses.length > 0 ? (
              <div className="space-y-4">
                {poem.verses.map((verse: GanjoorVerse, index: number) => (
                  <div key={verse.id} className="verse-line">
                    {verse.position === -1 ? (
                      // Paragraph (Prose)
                      <p className="text-justify text-lg leading-relaxed">
                        {verse.text}
                      </p>
                    ) : verse.position >= 2 ? (
                      // Centered verses
                      <div className="text-center">
                        <p className="text-lg">{verse.text}</p>
                      </div>
                    ) : (
                      // Hemistich verses
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-right">
                          {verse.position === 0 && (
                            <span className="text-lg">{verse.text}</span>
                          )}
                        </div>
                        <div className="text-left">
                          {verse.position === 1 && (
                            <span className="text-lg">{verse.text}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-persian-ink/70 persian-text">متأسفانه متنی برای این شعر یافت نشد.</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href={`/categories/${poem.category}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-persian-indigo text-white rounded-lg hover:bg-persian-indigo transition-colors persian-text font-medium"
            style={{backgroundColor: 'rgb(46 52 64 / 0.8)'}}
          >
            بازگشت به دسته‌بندی
          </Link>
          <Link
            href={`/poets/${poem.poet_id}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-persian-gold text-persian-ink rounded-lg hover:bg-persian-gold transition-colors persian-text font-medium"
            style={{backgroundColor: 'rgb(212 175 55 / 0.8)'}}
          >
            بازگشت به شاعر
          </Link>
        </div>
      </div>
    </div>
  );
}
