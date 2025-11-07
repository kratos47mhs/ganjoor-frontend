import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api, apiClient, GanjoorPoet, GanjoorCategoryList, PaginatedResponse } from '@/lib/api';

interface PoetPageProps {
  params: {
    id: string;
  };
}

async function getPoet(id: string): Promise<GanjoorPoet | null> {
  try {
    return await api.poets.get(parseInt(id));
  } catch (error) {
    console.error('Error fetching poet:', error);
    return null;
  }
}

async function getPoetCategories(id: string): Promise<GanjoorCategoryList[]> {
  try {
    // Use the categories filtering endpoint
    const response: PaginatedResponse<GanjoorCategoryList> = await api.categories.list({
      poet: parseInt(id)
    });
    return response.results;
  } catch (error) {
    console.error('Error fetching poet categories:', error);
    return [];
  }
}

// Note: We'll need to get poem counts separately or modify the API call
// For now, we'll show categories without poem counts

export default async function PoetPage({ params }: PoetPageProps) {
  const { id } = await params;

  // Validate ID is a positive number
  const poetId = parseInt(id);
  if (isNaN(poetId) || poetId <= 0) {
    notFound();
  }

  const poet = await getPoet(id);
  const categories = await getPoetCategories(id);

  if (!poet) {
    notFound();
  }

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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="nav-link persian-text">
            خانه
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          <span className="text-persian-ink persian-text">{poet.name}</span>
        </nav>

        {/* Poet Header */}
        <div className="persian-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Poet Image */}
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 flex-shrink-0" style={{borderColor: 'rgb(212 175 55 / 0.3)'}}>
              {poet.image ? (
                <Image
                  src={poet.image}
                  alt={poet.name}
                  fill
                  className="object-cover"
                  sizes="192px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{background: 'linear-gradient(to bottom right, rgb(212 175 55 / 0.2), rgb(46 52 64 / 0.2))'}}>
                  <span className="text-6xl text-persian-ink">ش</span>
                </div>
              )}
            </div>

            {/* Poet Info */}
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-4xl font-bold text-persian-ink mb-4 persian-text">
                {poet.name}
              </h1>

              <div className="flex justify-center md:justify-end mb-4">
                <span className={`px-4 py-2 rounded-full text-lg font-medium ${getCenturyColor(poet.century)}`}>
                  {getCenturyLabel(poet.century)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center md:text-right">
                  <div className="text-2xl font-bold text-persian-gold">{poet.categories_count}</div>
                  <div className="text-sm text-persian-ink/70 persian-text">دسته</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-2xl font-bold text-persian-gold">{poet.poems_count}</div>
                  <div className="text-sm text-persian-ink/70 persian-text">شعر</div>
                </div>
              </div>

              {poet.description && (
                <div className="prose prose-lg max-w-none persian-text text-persian-ink/80 leading-relaxed">
                  <p className="text-right">{poet.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-persian-ink mb-6 persian-text text-center md:text-right">
            دسته‌بندی‌ها
          </h2>

          {categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="persian-card p-6 hover:scale-105 transition-transform duration-200"
                >
                  <h3 className="text-xl font-semibold text-persian-ink mb-2 persian-text text-right">
                    {category.title}
                  </h3>
                  <div className="text-sm text-persian-ink/70 persian-text text-right">
                    مشاهده اشعار
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-persian-ink/70 persian-text">هیچ دسته‌بندی یافت نشد.</p>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-persian-gold text-persian-ink rounded-lg hover:bg-persian-gold transition-colors persian-text font-medium"
            style={{backgroundColor: 'rgb(212 175 55 / 0.8)'}}
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    </div>
  );
}
