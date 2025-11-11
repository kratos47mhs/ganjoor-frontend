'use client';

import { useEffect, useState } from 'react';
import PoetCard from '@/components/PoetCard';
import { api, GanjoorPoetList, PaginatedResponse } from '@/lib/api';

export default function Home() {
  const [allPoets, setAllPoets] = useState<GanjoorPoetList[]>([]);
  const [filteredPoets, setFilteredPoets] = useState<GanjoorPoetList[]>([]);
  const [displayedPoets, setDisplayedPoets] = useState<GanjoorPoetList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCentury, setSelectedCentury] = useState<string>('همه');
  const [readingMode, setReadingMode] = useState<'day' | 'night'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'poets' | 'poems'>('poets');
  const [searchResults, setSearchResults] = useState<GanjoorPoetList[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const poetsPerPage = 20;

  // Persian literary quotes for inspiration
  const inspirationalQuotes = [
    { text: "شعر آیینه روح انسان است", author: "فردوسی" },
    { text: "هر کس که در این بادیه منزل نگزید", author: "حافظ" },
    { text: "بشنو از نی چون حکایت می‌کند", author: "مولوی" },
    { text: "زندگانی شب تاریک و راهی دراز است", author: "سعدی" }
  ];

  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);

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
    setCurrentPage(1); // Reset to first page when filter changes
  }, [selectedCentury, allPoets]);

  // Update displayed poets based on current page
  useEffect(() => {
    const startIndex = (currentPage - 1) * poetsPerPage;
    const endIndex = startIndex + poetsPerPage;
    setDisplayedPoets(filteredPoets.slice(startIndex, endIndex));
  }, [filteredPoets, currentPage, poetsPerPage]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase().trim();

    if (searchType === 'poets') {
      const results = allPoets.filter(poet =>
        poet.name.toLowerCase().includes(query)
      );
      setSearchResults(results);
    } else {
      // For poems search, we'd need to implement poem search API
      // For now, just show poets whose names match
      const results = allPoets.filter(poet =>
        poet.name.toLowerCase().includes(query)
      );
      setSearchResults(results);
    }
  }, [searchQuery, searchType, allPoets]);

  const totalPages = Math.ceil(filteredPoets.length / poetsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className={`min-h-screen transition-colors duration-500 ${
      readingMode === 'night'
        ? 'bg-persian-midnight text-persian-parchment'
        : 'bg-gradient-to-br from-persian-parchment via-white to-persian-saffron/10'
    }`}>

      {/* Reading Mode Toggle */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setReadingMode(readingMode === 'day' ? 'night' : 'day')}
          className={`p-3 rounded-full shadow-lg transition-all duration-300 ${
            readingMode === 'night'
              ? 'bg-persian-gold text-persian-midnight hover:bg-persian-saffron'
              : 'bg-persian-indigo text-persian-parchment hover:bg-persian-lapis'
          }`}
          aria-label={readingMode === 'day' ? 'حالت شب' : 'حالت روز'}
        >
          {readingMode === 'day' ? '🌙' : '☀️'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="relative mb-8">
            <h1 className={`text-5xl md:text-7xl font-bold mb-4 persian-text transition-colors duration-500 ${
              readingMode === 'night' ? 'text-persian-gold' : 'text-persian-indigo'
            }`}>
              ❋ گنجور ❋
            </h1>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex space-x-2">
                <span className="text-persian-gold text-2xl animate-pulse">✦</span>
                <span className="text-persian-turquoise text-2xl animate-pulse delay-100">✦</span>
                <span className="text-persian-rose text-2xl animate-pulse delay-200">✦</span>
              </div>
            </div>
          </div>

          <p className={`text-xl md:text-2xl mb-8 persian-text font-light ${
            readingMode === 'night' ? 'text-persian-parchment/80' : 'text-persian-ink/70'
          }`}>
            خزینه گوهرهای شعر فارسی
          </p>

          {/* Inspirational Quote */}
          <div className={`max-w-2xl mx-auto mb-12 p-6 rounded-lg transition-colors duration-500 ${
            readingMode === 'night'
              ? 'bg-persian-indigo/20 border border-persian-gold/20'
              : 'bg-white/60 border border-persian-gold/20'
          }`}>
            <blockquote className="text-lg persian-text italic mb-4">
              "{currentQuote.text}"
            </blockquote>
            <cite className={`text-sm persian-text ${
              readingMode === 'night' ? 'text-persian-saffron' : 'text-persian-emerald'
            }`}>
              — {currentQuote.author}
            </cite>
          </div>

          {/* Reading Mode Indicators */}
          <div className="flex justify-center items-center gap-8 mb-12">
            <div className="flex items-center gap-2 text-sm persian-text">
              <span className="text-persian-saffron">☀️</span>
              <span className={readingMode === 'night' ? 'text-persian-parchment/60' : 'text-persian-ink'}>
                روز • مطالعه
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text">
              <span className="text-persian-indigo">🌙</span>
              <span className={readingMode === 'night' ? 'text-persian-ink' : 'text-persian-parchment/60'}>
                شب • تأمل
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text">
              <span className="text-persian-crimson">🎭</span>
              <span className={readingMode === 'night' ? 'text-persian-parchment/60' : 'text-persian-ink'}>
                شعر • هنر
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm persian-text">
              <span className="text-persian-turquoise">🔊</span>
              <span className={readingMode === 'night' ? 'text-persian-parchment/60' : 'text-persian-ink'}>
                شنیدن • نوا
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-16">
          <div className={`max-w-4xl mx-auto p-8 rounded-xl transition-colors duration-500 ${
            readingMode === 'night'
              ? 'bg-persian-indigo/10 border border-persian-gold/20'
              : 'bg-white/80 backdrop-blur-sm border border-persian-gold/20 shadow-lg'
          }`}>

            {/* Search Bar */}
            <div className="mb-8">
              <h2 className={`text-2xl font-bold text-center mb-6 persian-text ${
                readingMode === 'night' ? 'text-persian-gold' : 'text-persian-indigo'
              }`}>
                🔍 جستجو در گنجور
              </h2>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                {/* Search Type Toggle */}
                <div className="flex rounded-lg p-1 bg-persian-gold/10">
                  <button
                    onClick={() => setSearchType('poets')}
                    className={`px-4 py-2 rounded-md persian-text transition-all duration-300 ${
                      searchType === 'poets'
                        ? 'bg-persian-gold text-persian-ink shadow-md'
                        : 'text-persian-ink/70 hover:text-persian-ink'
                    }`}
                  >
                    شاعران
                  </button>
                  <button
                    onClick={() => setSearchType('poems')}
                    className={`px-4 py-2 rounded-md persian-text transition-all duration-300 ${
                      searchType === 'poems'
                        ? 'bg-persian-gold text-persian-ink shadow-md'
                        : 'text-persian-ink/70 hover:text-persian-ink'
                    }`}
                  >
                    اشعار
                  </button>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchType === 'poets' ? 'نام شاعر را جستجو کنید...' : 'متن شعر یا عنوان را جستجو کنید...'}
                    className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-300 persian-text ${
                      readingMode === 'night'
                        ? 'bg-persian-indigo/20 border-persian-gold/30 text-persian-parchment placeholder-persian-parchment/50 focus:border-persian-gold'
                        : 'bg-white border-persian-gold/30 text-persian-ink placeholder-persian-ink/50 focus:border-persian-gold'
                    } focus:outline-none focus:ring-2 focus:ring-persian-gold/20`}
                    dir="rtl"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <span className="text-persian-gold text-lg">🔍</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Century Timeline */}
            <div>
              <h3 className={`text-xl font-bold text-center mb-6 persian-text ${
                readingMode === 'night' ? 'text-persian-saffron' : 'text-persian-emerald'
              }`}>
                دوره‌های زمانی
              </h3>

              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { key: 'همه', label: 'همه دوره‌ها', color: 'bg-gradient-to-r from-persian-gold to-persian-saffron' },
                  { key: 'باستانی', label: 'باستانی', color: 'bg-gradient-to-r from-persian-crimson to-persian-rose' },
                  { key: 'کلاسیک', label: 'کلاسیک', color: 'bg-gradient-to-r from-persian-gold to-persian-emerald' },
                  { key: 'معاصر', label: 'معاصر', color: 'bg-gradient-to-r from-persian-turquoise to-persian-lapis' },
                  { key: 'نو', label: 'نو', color: 'bg-gradient-to-r from-persian-indigo to-persian-midnight' }
                ].map((century) => (
                  <button
                    key={century.key}
                    onClick={() => setSelectedCentury(century.key)}
                    className={`px-4 py-2 rounded-full text-white font-medium persian-text text-sm transition-all duration-300 transform hover:scale-105 shadow-md ${
                      selectedCentury === century.key
                        ? `${century.color} ring-2 ring-white/50 scale-105`
                        : `${century.color} hover:shadow-lg opacity-80 hover:opacity-100`
                    }`}
                  >
                    {century.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Results or All Poets Grid */}
        {isSearching && searchQuery.trim() !== '' ? (
          <div className="mb-16">
            <h2 className={`text-2xl font-bold text-center mb-8 persian-text ${
              readingMode === 'night' ? 'text-persian-saffron' : 'text-persian-emerald'
            }`}>
              نتایج جستجو برای "{searchQuery}"
            </h2>

            {searchResults.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {searchResults.map((poet: GanjoorPoetList) => (
                    <div key={poet.id} className="animate-fade-in">
                      <PoetCard poet={poet} readingMode={readingMode} />
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <p className={`text-sm persian-text ${
                    readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'
                  }`}>
                    {searchResults.length} نتیجه یافت شد
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className={`text-6xl mb-4 ${readingMode === 'night' ? 'text-persian-gold/30' : 'text-persian-ink/30'}`}>
                  🔍
                </div>
                <p className={`text-xl persian-text mb-4 ${
                  readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'
                }`}>
                  نتیجه‌ای یافت نشد
                </p>
                <p className={`text-sm persian-text ${
                  readingMode === 'night' ? 'text-persian-parchment/50' : 'text-persian-ink/50'
                }`}>
                  برای "{searchQuery}" نتیجه‌ای در {searchType === 'poets' ? 'شاعران' : 'اشعار'} یافت نشد
                </p>
              </div>
            )}
          </div>
        ) : (
          /* All Poets with Pagination */
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-2xl font-bold persian-text ${
                readingMode === 'night' ? 'text-persian-saffron' : 'text-persian-emerald'
              }`}>
                {selectedCentury === 'همه' ? 'همه شاعران' : `شاعران ${selectedCentury}`}
              </h2>
              <div className={`text-sm persian-text px-3 py-1 rounded-full ${
                readingMode === 'night'
                  ? 'bg-persian-indigo/20 text-persian-parchment/70'
                  : 'bg-persian-gold/10 text-persian-ink/70'
              }`}>
                صفحه {currentPage} از {totalPages} • {filteredPoets.length} شاعر
              </div>
            </div>

            {displayedPoets.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                  {displayedPoets.map((poet: GanjoorPoetList) => (
                    <div key={poet.id} className="animate-fade-in">
                      <PoetCard poet={poet} readingMode={readingMode} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg persian-text transition-all duration-300 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : `hover:bg-persian-gold/10 ${
                              readingMode === 'night' ? 'text-persian-parchment' : 'text-persian-ink'
                            }`
                      }`}
                    >
                      قبلی
                    </button>

                    {/* Page Numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg persian-text transition-all duration-300 ${
                            pageNum === currentPage
                              ? 'bg-persian-gold text-persian-ink shadow-md'
                              : `hover:bg-persian-gold/10 ${
                                  readingMode === 'night' ? 'text-persian-parchment' : 'text-persian-ink'
                                }`
                          }`}
                        >
                          {pageNum.toLocaleString('fa-IR')}
                        </button>
                      );
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg persian-text transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : `hover:bg-persian-gold/10 ${
                              readingMode === 'night' ? 'text-persian-parchment' : 'text-persian-ink'
                            }`
                      }`}
                    >
                      بعدی
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <div className={`text-6xl mb-4 ${readingMode === 'night' ? 'text-persian-gold/30' : 'text-persian-ink/30'}`}>
                  ❋
                </div>
                <p className={`text-xl persian-text ${
                  readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'
                }`}>
                  {selectedCentury === 'همه' ? 'هیچ شاعری یافت نشد.' : `هیچ شاعر ${selectedCentury} یافت نشد.`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cultural Footer */}
        <div className={`text-center py-12 border-t transition-colors duration-500 ${
          readingMode === 'night' ? 'border-persian-gold/20' : 'border-persian-gold/30'
        }`}>
          <div className="max-w-4xl mx-auto">
            <h3 className={`text-2xl font-bold mb-6 persian-text ${
              readingMode === 'night' ? 'text-persian-gold' : 'text-persian-indigo'
            }`}>
              گنجور - میراث فرهنگی ایران
            </h3>
            <p className={`text-lg leading-relaxed persian-text mb-8 ${
              readingMode === 'night' ? 'text-persian-parchment/80' : 'text-persian-ink/80'
            }`}>
              بیش از هزار سال ادبیات فارسی در دستان شما. از شاهنامه فردوسی تا غزلیات حافظ،
              از اشعار مولوی تا رباعیات خیام. هر بیت، دریچه‌ای به روح و فرهنگ ایرانی.
            </p>

            <div className="flex justify-center items-center gap-8 text-sm persian-text">
              <div className="flex items-center gap-2">
                <span className="text-persian-gold">📚</span>
                <span className={readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'}>
                  {filteredPoets.reduce((sum, poet) => sum + poet.poems_count, 0).toLocaleString('fa-IR')} شعر
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-persian-emerald">👥</span>
                <span className={readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'}>
                  {filteredPoets.length.toLocaleString('fa-IR')} شاعر
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-persian-turquoise">⏱️</span>
                <span className={readingMode === 'night' ? 'text-persian-parchment/70' : 'text-persian-ink/70'}>
                  هزار سال تاریخ
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
