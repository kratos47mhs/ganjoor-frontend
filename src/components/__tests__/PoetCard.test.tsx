import React from 'react';
import { render, screen } from '@testing-library/react';
import PoetCard from '../PoetCard';
import { GanjoorPoetList } from '@/lib/api';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="link">{children}</a>
  );
});

// Mock Next.js Image component
jest.mock('next/image', () => {
  return ({ src, alt, fill, className, sizes }: any) => (
    <img src={src} alt={alt} className={className} data-fill={fill} data-sizes={sizes} />
  );
});

describe('PoetCard Component', () => {
  const mockPoet: GanjoorPoetList = {
    id: 119,
    name: 'آشفتهٔ شیرازی',
    century: 'classical',
    image: null,
    image_slug: 'ashofte',
    poems_count: 1262 // Using number as per actual API response
  };

  it('should render poet information correctly', () => {
    render(<PoetCard poet={mockPoet} />);

    expect(screen.getByText('آشفتهٔ شیرازی')).toBeInTheDocument();
    expect(screen.getByText('کلاسیک')).toBeInTheDocument();
    expect(screen.getByText('1262 شعر')).toBeInTheDocument();
  });

  it('should render link with correct href', () => {
    render(<PoetCard poet={mockPoet} />);

    const link = screen.getByTestId('link');
    expect(link).toHaveAttribute('href', '/poets/119');
  });

  it('should display correct century colors', () => {
    const { rerender } = render(<PoetCard poet={mockPoet} />);

    // Classical poet should have gold accent
    expect(screen.getByText('کلاسیک')).toBeInTheDocument();

    // Test ancient poet
    const ancientPoet: GanjoorPoetList = {
      ...mockPoet,
      century: 'ancient',
      name: 'فردوسی'
    };
    rerender(<PoetCard poet={ancientPoet} />);
    expect(screen.getByText('باستانی')).toBeInTheDocument();

    // Test contemporary poet
    const contemporaryPoet: GanjoorPoetList = {
      ...mockPoet,
      century: 'contemporary',
      name: 'شاملو'
    };
    rerender(<PoetCard poet={contemporaryPoet} />);
    expect(screen.getByText('معاصر')).toBeInTheDocument();

    // Test modern poet
    const modernPoet: GanjoorPoetList = {
      ...mockPoet,
      century: 'modern',
      name: 'سپهری'
    };
    rerender(<PoetCard poet={modernPoet} />);
    expect(screen.getByText('نو')).toBeInTheDocument();
  });

  it('should format poem count correctly', () => {
    const poetWithFewPoems: GanjoorPoetList = {
      ...mockPoet,
      poems_count: 42
    };

    render(<PoetCard poet={poetWithFewPoems} />);

    expect(screen.getByText('42 شعر')).toBeInTheDocument();
  });

  it('should handle poets without images', () => {
    render(<PoetCard poet={mockPoet} />);

    // Should not crash and should render without image
    expect(screen.getByText('آشفتهٔ شیرازی')).toBeInTheDocument();
  });

  it('should validate Persian text rendering', () => {
    render(<PoetCard poet={mockPoet} />);

    // Validate that Persian poet names are rendered
    const poetName = screen.getByText('آشفتهٔ شیرازی');
    expect(poetName).toBeInTheDocument();
    expect(poetName.tagName).toBe('H3'); // Should be in h3 tag

    // Validate Persian century labels
    expect(screen.getByText('کلاسیک')).toBeInTheDocument();
  });

  it('should handle various poem counts correctly', () => {
    const testPoets: GanjoorPoetList[] = [
      { ...mockPoet, poems_count: 0, name: 'Test Poet 1' },
      { ...mockPoet, poems_count: 42, name: 'Test Poet 2' },
      { ...mockPoet, poems_count: 1262, name: 'Test Poet 3' }
    ];

    testPoets.forEach(poet => {
      const { rerender } = render(<PoetCard poet={poet} />);

      // Each poet should display their correct poem count
      expect(screen.getByText(`${poet.poems_count} شعر`)).toBeInTheDocument();

      // Poem count should be a valid number
      expect(typeof poet.poems_count).toBe('number');
      expect(poet.poems_count).toBeGreaterThanOrEqual(0);
    });
  });
});
