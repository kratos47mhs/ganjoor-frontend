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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderBottomColor: 'rgb(212 175 55)'}}></div>
          <p className="text-persian-ink persian-text">در حال بارگذاری...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-persian-ink mb-4 persian-text">
            گنجور - مجموعه اشعار فارسی
          </h1>
          <p className="text-lg text-persian-ink/70 persian-text max-w-2xl mx-auto">
            به دنیای زیبای شعر و ادب پارسی خوش آمدید. شاعران بزرگ ایران را کشف کنید و از اشعار جاودانه آنها لذت ببرید.
          </p>
        </div>

        {/* Century Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 flex-wrap justify-center">
            {['همه', 'باستانی', 'کلاسیک', 'معاصر', 'نو'].map((century) => (
              <button
                key={century}
                onClick={() => setSelectedCentury(century)}
                className={`px-4 py-2 rounded-full border transition-colors persian-text ${
                  selectedCentury === century
                    ? 'bg-persian-gold text-persian-ink'
                    : 'bg-persian-parchment text-persian-ink hover:bg-persian-gold hover:text-white'
                }`}
                style={{borderColor: 'rgb(212 175 55 / 0.3)'}}
              >
                {century}
              </button>
            ))}
          </div>
        </div>

        {/* Poets Grid */}
        {filteredPoets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPoets.map((poet: GanjoorPoetList) => (
              <PoetCard key={poet.id} poet={poet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-persian-ink/70 persian-text">
              {selectedCentury === 'همه' ? 'هیچ شاعری یافت نشد.' : `هیچ شاعر ${selectedCentury} یافت نشد.`}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-persian-gold" style={{borderTopColor: 'rgb(212 175 55 / 0.2)'}}>
          <p className="text-persian-ink/60 persian-text">
            گنجور - پلتفرم جامع اشعار فارسی
          </p>
        </div>
      </div>
    </div>
  );
}
