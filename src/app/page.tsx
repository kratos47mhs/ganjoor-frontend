'use client';

import { useEffect, useState } from 'react';
import PoetCard from '@/components/PoetCard';
import { api, GanjoorPoetList, PaginatedResponse } from '@/lib/api';

export default function Home() {
  const [allPoets, setAllPoets] = useState<GanjoorPoetList[]>([]);
  const [filteredPoets, setFilteredPoets] = useState<GanjoorPoetList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCentury, setSelectedCentury] = useState<string>('همه');

  useEffect(() => {
    const fetchAllPoets = async () => {
      try {
        const allPoetsData: GanjoorPoetList[] = [];
        let nextUrl: string | null = null;
        let page = 1;

        // Load all pages of poets with delay to avoid rate limiting
        do {
          const response: PaginatedResponse<GanjoorPoetList> = nextUrl
            ? await api.poets.list({ page })
            : await api.poets.list();

          allPoetsData.push(...response.results);
          nextUrl = response.next;
          page++;

          // Add delay between requests to avoid rate limiting
          if (nextUrl && page <= 10) {
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
          }
        } while (nextUrl && page <= 10); // Limit to 10 pages to avoid infinite loops

        setAllPoets(allPoetsData);
        setFilteredPoets(allPoetsData);
      } catch (err) {
        setError('خطا در بارگذاری شاعران');
        console.error('Error fetching poets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPoets();
  }, []);

  useEffect(() => {
    if (selectedCentury === 'همه') {
      setFilteredPoets(allPoets);
    } else {
      const centuryMap: { [key: string]: string } = {
        'باستانی': 'ancient',
        'کلاسیک': 'classical',
        'معاصر': 'contemporary',
        'نو': 'modern'
      };

      const centuryValue = centuryMap[selectedCentury];
      const filtered = allPoets.filter(poet => poet.century === centuryValue);
      setFilteredPoets(filtered);
    }
  }, [selectedCentury, allPoets]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-poetry-gradient">
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-persian-gold/20 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-persian-gold absolute top-0 mx-auto"></div>
          </div>
          <div className="persian-motif mb-4"></div>
          <p className="text-persian-ink persian-text text-lg font-medium">در حال بارگذاری اشعار...</p>
          <p className="text-persian-ink/60 persian-text text-sm mt-2">لطفاً صبر کنید</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 persian-text mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-persian-gold text-persian-ink rounded-lg hover:bg-persian-gold transition-colors"
            style={{backgroundColor: 'rgb(212 175 55 / 0.8)'}}
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 persian-text">
            گنجور
          </h1>
          <p className="text-gray-600 persian-text text-sm">
            مجموعه اشعار فارسی
          </p>
        </div>

        {/* Century Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex gap-4 flex-wrap justify-center">
              {['همه', 'باستانی', 'کلاسیک', 'معاصر', 'نو'].map((century) => (
                <button
                  key={century}
                  onClick={() => setSelectedCentury(century)}
                  className={`px-4 py-2 text-sm persian-text transition-colors ${
                    selectedCentury === century
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {century}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Poets Grid */}
        {filteredPoets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPoets.map((poet: GanjoorPoetList) => (
              <PoetCard key={poet.id} poet={poet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 persian-text">
              {selectedCentury === 'همه' ? 'هیچ شاعری یافت نشد.' : `هیچ شاعر ${selectedCentury} یافت نشد.`}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-gray-500 persian-text text-sm">
            گنجور - پلتفرم جامع اشعار فارسی
          </p>
        </div>
      </div>
    </div>
  );
}
