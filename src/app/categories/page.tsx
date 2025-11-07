import Link from 'next/link';
import { api, GanjoorCategoryList, PaginatedResponse } from '@/lib/api';

async function getCategories() {
  try {
    const response: PaginatedResponse<GanjoorCategoryList> = await api.categories.list();
    return response.results;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-persian-ink mb-4 persian-text">
            دسته‌بندی‌ها
          </h1>
          <p className="text-persian-ink/70 persian-text">
            مجموعه کامل دسته‌بندی‌های شعر فارسی
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/" className="nav-link persian-text">
            خانه
          </Link>
          <span className="mx-2 text-persian-ink/50">/</span>
          <span className="text-persian-ink persian-text">دسته‌بندی‌ها</span>
        </nav>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category: GanjoorCategoryList) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="persian-card p-6 hover:scale-105 transition-transform duration-200"
              >
                <div className="text-right">
                  <h3 className="text-xl font-semibold text-persian-ink mb-2 persian-text">
                    {category.title}
                  </h3>
                  <div className="text-sm text-persian-ink/70 persian-text mb-2">
                    از {category.poet_name}
                  </div>
                  {category.parent_title && (
                    <div className="text-sm text-persian-ink/60 persian-text mb-1">
                      زیرمجموعه: {category.parent_title}
                    </div>
                  )}
                  <div className="text-sm text-persian-gold font-medium persian-text">
                    {category.poems_count} شعر
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-persian-ink/70 persian-text mb-4">
              در حال بارگذاری دسته‌بندی‌ها...
            </p>
            <p className="text-sm text-persian-ink/50 persian-text">
              اگر دسته‌بندی‌ها نمایش داده نمی‌شوند، لطفاً صفحه را مجدداً بارگذاری کنید.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-center items-center mt-12">
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
