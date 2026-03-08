import React from 'react';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  borderRadius = '8px',
  className = '',
}) => (
  <div
    className={`placeholder-glow ${className}`}
    style={{ width, height, borderRadius, backgroundColor: 'var(--color-border, #e0e0e0)', animation: 'placeholder-glow 2s ease-in-out infinite' }}
  >
    <span className="placeholder w-100 h-100" style={{ borderRadius, display: 'block' }} />
  </div>
);

export const CardSkeleton = () => (
  <div className="col-md-6 col-lg-4 mb-4">
    <div className="card h-100" style={{ borderColor: 'var(--color-border)' }}>
      <Skeleton height="200px" borderRadius="8px 8px 0 0" />
      <div className="card-body">
        <Skeleton height="24px" width="70%" className="mb-3" />
        <Skeleton height="16px" className="mb-2" />
        <Skeleton height="16px" width="85%" className="mb-3" />
        <Skeleton height="36px" width="120px" borderRadius="20px" />
      </div>
    </div>
  </div>
);

export const HeroSkeleton = () => (
  <div
    style={{
      height: '400px',
      backgroundColor: 'var(--color-border, #e0e0e0)',
      borderRadius: '12px',
    }}
    className="placeholder-glow mb-4"
  >
    <span className="placeholder w-100 h-100" style={{ borderRadius: '12px', display: 'block' }} />
  </div>
);

export const PageSkeleton = ({ cards = 6 }: { cards?: number }) => (
  <main style={{ paddingTop: '80px' }}>
    <HeroSkeleton />
    <div className="container py-5">
      <div className="text-center mb-5">
        <Skeleton height="40px" width="300px" className="mx-auto mb-3" />
        <Skeleton height="20px" width="500px" className="mx-auto" />
      </div>
      <div className="row">
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </main>
);
