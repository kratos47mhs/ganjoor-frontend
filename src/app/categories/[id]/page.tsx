import { notFound } from 'next/navigation';
import Link from 'next/link';
import { api, GanjoorCategory, GanjoorCategoryList, GanjoorPoemList, PaginatedResponse } from '@/lib/api';

interface CategoryPageProps {
  params: {
    id: string;
  };
}

async function getCategoryData(id: string) {
  // Always create a fallback category first
  let category: GanjoorCategory = {
    id: parseInt(id),
    title: `دسته‌بندی ${id}`,
    url: null,
    poet: 0,
    poet_name: 'ناشناخته',
    parent: null,
    parent_title: null,
    children: [],
    poems_count: 0,
    breadcrumbs: ''
  };

  let poems: GanjoorPoemList[] = [];
  let subcategories: GanjoorCategoryList[] = [];
  let poemsError = false;

  try {
    // Try to get the real category details from the categories list
    // Since individual category endpoint doesn't work, we'll get it from the list
    console.log('Fetching category details from categories list API...');
    const categoriesResponse: PaginatedResponse<GanjoorCategoryList> = await api.categories.list();
    const foundCategory = categoriesResponse.results.find(cat => cat.id === parseInt(id));

    if (foundCategory) {
      // Convert GanjoorCategoryList to GanjoorCategory format
      category = {
        ...foundCategory,
        children: [], // Will be populated below if needed
        breadcrumbs: '' // Not available from list API
      };
      console.log('✅ Category found in list:', category.title, 'poems_count:', category.poems_count);
    } else {
      console.log('❌ Category', id, 'not found in categories list');
    }

    // If we got the category, try to get poems and subcategories
    try {
      // Use the dedicated category poems endpoint
      console.log('Fetching poems for category', id, 'using dedicated category poems endpoint');
      const poemsResponse: PaginatedResponse<GanjoorPoemList> = await api.categories.poems(parseInt(id));
      poems = poemsResponse.results;
      console.log('✅ Category poems API returned:', poems.length, 'poems for category', id);
      console.log('📝 Sample poem:', poems[0]?.title || 'No poems');
    } catch (error) {
      const apiError = error as { message?: string };
      console.log('❌ Could not fetch poems for category', id, 'using dedicated endpoint:', apiError.message || 'Unknown error');
      console.log('🔄 Trying general poems API as fallback');
      try {
        // Fallback to general poems endpoint with category filter
        const poemsResponse: PaginatedResponse<GanjoorPoemList> = await api.poems.list({
          category: parseInt(id)
        });
        poems = poemsResponse.results;
        console.log('✅ Fallback poems API returned:', poems.length, 'poems for category', id);
        console.log('📝 Sample poem:', poems[0]?.title || 'No poems');
      } catch (fallbackError) {
        const fallbackApiError = fallbackError as { message?: string };
        console.log('❌ Could not fetch poems for category', id, 'with fallback either:', fallbackApiError.message || 'Unknown error');
        poemsError = true;
      }
    }

    try {
      const subcatsResponse: PaginatedResponse<GanjoorCategoryList> = await api.categories.list({
        parent: parseInt(id)
      });
      subcategories = subcatsResponse.results;
    } catch (error) {
      const apiError = error as { message?: string };
      console.log('Could not fetch subcategories for category', id, apiError.message || 'Unknown error');
    }
  } catch (error) {
    const apiError = error as { message?: string };
    console.log('Rate limited or error fetching category, using fallback for', id, apiError.message || 'Unknown error');
  }

  return {
    category,
    poems,
    subcategories,
    poemsError
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { id } = await params;
  const data = await getCategoryData(id);

  if (!data) {
    notFound();
  }

  const { category, poems, subcategories, poemsError } = data;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="nav-link persian-text">
            خانه
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          {category.poet > 0 ? (
            <>
              <Link href={`/poets/${category.poet}`} className="nav-link persian-text">
                {category.poet_name}
              </Link>
              <span className="mx-2 text-persian-ink/50">/</span>
            </>
          ) : (
            <span className="text-persian-ink/70 persian-text">{category.poet_name}</span>
          )}
          <span className="text-persian-ink persian-text">{category.title}</span>
        </nav>

        {/* Category Header */}
        <div className="persian-card p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-persian-ink mb-4 persian-text">
              {category.title}
            </h1>
            <div className="flex justify-center items-center gap-4 text-sm text-persian-ink/70 persian-text">
              <span>از {category.poet_name}</span>
              <span>•</span>
              <span>{category.poems_count} شعر</span>
            </div>
            {category.url && (
              <a
                href={category.url}
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

        {/* Subcategories Section */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-persian-ink mb-6 persian-text text-center md:text-right">
              زیرشاخه‌ها
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subcategories.map((subcategory: GanjoorCategoryList) => (
                <Link
                  key={subcategory.id}
                  href={`/categories/${subcategory.id}`}
                  className="persian-card p-6 hover:scale-105 transition-transform duration-200"
                >
                  <h3 className="text-xl font-semibold text-persian-ink mb-2 persian-text text-right">
                    {subcategory.title}
                  </h3>
                  <div className="text-sm text-persian-ink/60 persian-text text-right">
                    زیرشاخه
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}



        {/* Poems Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-persian-ink mb-6 persian-text text-center md:text-right">
            اشعار
          </h2>

          {poems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {poems.map((poem: GanjoorPoemList) => (
                <Link
                  key={poem.id}
                  href={`/poems/${poem.id}`}
                  className="persian-card p-6 hover:scale-105 transition-transform duration-200"
                >
                  <h3 className="text-xl font-semibold text-persian-ink mb-2 persian-text text-right">
                    {poem.title}
                  </h3>
                  <div className="text-sm text-persian-ink/70 persian-text text-right mb-2">
                    {poem.verses_count} بیت
                  </div>
                  <div className="text-sm text-persian-ink/60 persian-text text-right">
                    {poem.category_title}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              {poemsError ? (
                <div>
                  <p className="text-persian-ink/70 persian-text mb-4">
                    به دلیل محدودیت نرخ درخواست‌ها، اشعار موقتاً قابل نمایش نیستند.
                  </p>
                  <p className="text-sm text-persian-ink/50 persian-text">
                    لطفاً چند دقیقه صبر کنید و دوباره امتحان کنید.
                  </p>
                </div>
              ) : (
                <p className="text-persian-ink/70 persian-text">هیچ شعری در این دسته‌بندی یافت نشد.</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-center items-center">
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
