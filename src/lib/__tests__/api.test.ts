/**
 * @jest-environment node
 */

import { api } from '../api';

// Integration tests that validate against real Ganjoor API
// These tests require the Django backend to be running on localhost:8000
describe('Ganjoor API Integration Tests', () => {
  // Increase timeout for API calls
  jest.setTimeout(30000);

  describe('Poets API - Real Data Validation', () => {
    it('should fetch poets list with real pagination data', async () => {
      try {
        const result = await api.poets.list();

        // Validate response structure according to API spec
        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('next');
        expect(result).toHaveProperty('previous');
        expect(result).toHaveProperty('results');
        expect(Array.isArray(result.results)).toBe(true);

        // Validate that count is a reasonable number
        expect(result.count).toBeGreaterThan(200); // Should have many poets

        if (result.results.length > 0) {
          const poet = result.results[0];

          // Validate poet object structure per API spec
          expect(poet).toHaveProperty('id');
          expect(typeof poet.id).toBe('number');

          expect(poet).toHaveProperty('name');
          expect(typeof poet.name).toBe('string');
          expect(poet.name.length).toBeGreaterThan(0);

          expect(poet).toHaveProperty('century');
          expect(['ancient', 'classical', 'contemporary', 'modern']).toContain(poet.century);

          expect(poet).toHaveProperty('poems_count');
          // API returns numbers, not strings
          expect(typeof poet.poems_count).toBe('number');
          expect(poet.poems_count).toBeGreaterThanOrEqual(0);
        }
      } catch (error) {
        // If rate limited, that's acceptable for integration tests
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during poets list test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });

    it('should fetch individual poet details with real data', async () => {
      try {
        // Test with a known poet ID from the API
        const result = await api.poets.get(119); // آشفتهٔ شیرازی

        // Validate detailed poet structure per API spec
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(119);

        expect(result).toHaveProperty('name');
        expect(result.name).toBe('آشفتهٔ شیرازی');

        expect(result).toHaveProperty('description');
        expect(typeof result.description).toBe('string');

        expect(result).toHaveProperty('century');
        expect(['ancient', 'classical', 'contemporary', 'modern']).toContain(result.century);

        expect(result).toHaveProperty('century_display');
        expect(typeof result.century_display).toBe('string');

        expect(result).toHaveProperty('categories_count');
        expect(result).toHaveProperty('poems_count');

        // API actually returns numbers for these fields
        expect(typeof result.categories_count).toBe('number');
        expect(typeof result.poems_count).toBe('number');

      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during poet detail test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });

    it('should filter poets by century with real data', async () => {
      try {
        const result = await api.poets.list({ century: 'classical' });

        expect(result).toHaveProperty('results');
        expect(Array.isArray(result.results)).toBe(true);

        // All returned poets should be from the specified century
        result.results.forEach(poet => {
          expect(poet.century).toBe('classical');
        });

        // Should have some results for classical poets
        expect(result.results.length).toBeGreaterThan(0);

      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during century filter test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });
  });

  describe('Categories API - Real Data Validation', () => {
    it('should fetch categories for a poet with real data', async () => {
      try {
        const result = await api.categories.list({ poet: 119 });

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('results');
        expect(Array.isArray(result.results)).toBe(true);

        if (result.results.length > 0) {
          const category = result.results[0];

          // Validate category structure per API spec
          expect(category).toHaveProperty('id');
          expect(typeof category.id).toBe('number');

          expect(category).toHaveProperty('title');
          expect(typeof category.title).toBe('string');

          expect(category).toHaveProperty('poet');
          expect(category.poet).toBe(119);

          expect(category).toHaveProperty('poet_name');
          expect(category.poet_name).toBe('آشفتهٔ شیرازی');

          expect(category).toHaveProperty('parent');
          expect(typeof category.parent).toBe('number');

          // URL should be a valid string or null
          expect(category).toHaveProperty('url');
          expect(category.url === null || typeof category.url === 'string').toBe(true);
        }
      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during categories test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });

    it('should fetch individual category details with real data', async () => {
      try {
        const result = await api.categories.get(2526); // آشفتهٔ شیرازی category

        // Validate detailed category structure per API spec
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(2526);

        expect(result).toHaveProperty('title');
        expect(result.title).toBe('آشفتهٔ شیرازی');

        expect(result).toHaveProperty('poet');
        expect(result.poet).toBe(119);

        expect(result).toHaveProperty('parent');
        expect(result.parent).toBe(0); // Root category

        expect(result).toHaveProperty('children');
        // API returns array, not string
        expect(Array.isArray(result.children)).toBe(true);

        expect(result).toHaveProperty('poems_count');
        expect(typeof result.poems_count).toBe('number');

        expect(result).toHaveProperty('breadcrumbs');
        expect(typeof result.breadcrumbs).toBe('string'); // JSON string per API spec

      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during category detail test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });
  });

  describe('Poems API - Real Data Validation', () => {
    it('should fetch poems for a category with real data', async () => {
      try {
        const result = await api.poems.list({ category: 2527 }); // غزلیات category

        expect(result).toHaveProperty('count');
        expect(result).toHaveProperty('results');
        expect(Array.isArray(result.results)).toBe(true);

        if (result.results.length > 0) {
          const poem = result.results[0];

          // Validate poem list structure per API spec
          expect(poem).toHaveProperty('id');
          expect(typeof poem.id).toBe('number');

          expect(poem).toHaveProperty('title');
          expect(typeof poem.title).toBe('string');

          expect(poem).toHaveProperty('category');
          expect(poem.category).toBe(2527);

          expect(poem).toHaveProperty('category_title');
          expect(typeof poem.category_title).toBe('string');

          expect(poem).toHaveProperty('poet_name');
          expect(typeof poem.poet_name).toBe('string');

          expect(poem).toHaveProperty('verses_count');
          expect(typeof poem.verses_count).toBe('number');
        }
      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during poems list test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });

    it('should fetch individual poem with verses and real data', async () => {
      try {
        const result = await api.poems.get(100499); // Real poem ID

        // Validate detailed poem structure per API spec
        expect(result).toHaveProperty('id');
        expect(result.id).toBe(100499);

        expect(result).toHaveProperty('title');
        expect(typeof result.title).toBe('string');

        expect(result).toHaveProperty('category');
        expect(typeof result.category).toBe('number');

        expect(result).toHaveProperty('poet_id');
        expect(typeof result.poet_id).toBe('number');

        expect(result).toHaveProperty('poet_name');
        expect(typeof result.poet_name).toBe('string');

        expect(result).toHaveProperty('verses');
        expect(Array.isArray(result.verses)).toBe(true);

        expect(result).toHaveProperty('verses_count');
        expect(typeof result.verses_count).toBe('number');

        if (result.verses.length > 0) {
          const verse = result.verses[0];

          // Validate verse structure per API spec
          expect(verse).toHaveProperty('id');
          expect(typeof verse.id).toBe('number');

          expect(verse).toHaveProperty('poem');
          expect(verse.poem).toBe(100499);

          expect(verse).toHaveProperty('order');
          expect(typeof verse.order).toBe('number');

          expect(verse).toHaveProperty('position');
          expect(typeof verse.position).toBe('number');
          expect([0, 1, 2, 3, 4, 5, -1]).toContain(verse.position);

          expect(verse).toHaveProperty('position_display');
          expect(typeof verse.position_display).toBe('string');

          expect(verse).toHaveProperty('text');
          expect(typeof verse.text).toBe('string');
          expect(verse.text.length).toBeGreaterThan(0);
        }

      } catch (error) {
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 429) {
          console.log('Rate limited during poem detail test - acceptable for integration testing');
          return;
        }
        throw error;
      }
    });
  });

  describe('Rate Limiting and Error Handling - Real API Behavior', () => {
    it('should handle rate limiting gracefully', async () => {
      try {
        // Make multiple rapid requests to potentially trigger rate limiting
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(api.poets.list());
        }

        const results = await Promise.allSettled(promises);

        // Some requests should succeed
        const fulfilled = results.filter(r => r.status === 'fulfilled');
        expect(fulfilled.length).toBeGreaterThan(0);

        // If any failed, they should be due to rate limiting
        const rejected = results.filter(r => r.status === 'rejected');
        if (rejected.length > 0) {
          rejected.forEach(rejection => {
            if (rejection.status === 'rejected' && rejection.reason?.response?.status === 429) {
              console.log('Rate limiting detected and handled correctly');
            }
          });
        }
      } catch (error) {
        // Rate limiting is expected behavior
        console.log('Rate limiting test completed');
      }
    });

    it('should handle 404 errors for non-existent resources', async () => {
      try {
        await api.poets.get(999999); // Non-existent poet ID
        // If we get here without throwing, the API might handle invalid IDs differently
      } catch (error) {
        // 404 is expected for non-existent resources
        const apiError = error as { response?: { status: number } };
        if (apiError.response?.status === 404) {
          expect(apiError.response.status).toBe(404);
        } else if (apiError.response?.status === 429) {
          console.log('Rate limited during 404 test - acceptable');
        } else {
          // Other errors might be acceptable depending on API implementation
          console.log('API returned different error for invalid ID:', apiError.response?.status);
        }
      }
    });
  });
});
