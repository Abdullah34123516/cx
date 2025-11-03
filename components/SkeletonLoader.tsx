import React from 'react';

// Base skeleton element
const SkeletonBase: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-slate-200 rounded animate-pulse ${className}`} />
);

// Specific skeleton components
export const SkeletonLine: React.FC<{ width?: string; height?: string; className?: string }> = ({ width = 'w-full', height = 'h-4', className }) => (
  <SkeletonBase className={`${width} ${height} ${className}`} />
);

export const SkeletonCircle: React.FC<{ size?: string; className?: string }> = ({ size = 'h-12 w-12', className }) => (
  <SkeletonBase className={`${size} rounded-full ${className}`} />
);

export const SkeletonCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`p-4 bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

// Page-specific skeletons
export const HomePageSkeleton: React.FC = () => (
    <div className="min-h-screen bg-slate-50">
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <SkeletonLine width="w-32" height="h-8" />
                    <div className="hidden md:flex items-center space-x-8">
                        <SkeletonLine width="w-16" />
                        <SkeletonLine width="w-16" />
                        <SkeletonLine width="w-16" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <SkeletonLine width="w-24" height="h-10" className="rounded-full" />
                        <SkeletonLine width="w-32" height="h-6" className="hidden md:block" />
                    </div>
                </div>
            </div>
        </header>

        {/* Hero Skeleton */}
        <section className="bg-white pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <SkeletonLine width="w-3/4" height="h-14" className="mx-auto" />
                <SkeletonLine width="w-1/2" height="h-6" className="mx-auto mt-6" />
                <div className="mt-10 max-w-xl mx-auto">
                    <SkeletonLine width="w-full" height="h-16" className="rounded-full" />
                </div>
            </div>
        </section>

        {/* Services Skeleton */}
        <section className="bg-slate-50 py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <SkeletonLine width="w-1/3" height="h-10" className="mx-auto mb-12" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center p-4">
                            <SkeletonCircle size="h-20 w-20" />
                            <SkeletonLine width="w-24" className="mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
);


export const DashboardSkeleton: React.FC = () => {
    // A simplified generic dashboard skeleton
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <SkeletonLine width="w-32" height="h-8" />
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                           <SkeletonLine width="w-24" height="h-5" />
                           <SkeletonLine width="w-16" height="h-3" className="mt-1" />
                        </div>
                        <SkeletonCircle size="h-12 w-12" />
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto space-y-8">
                    <SkeletonCard className="p-6">
                        <SkeletonLine width="w-1/2" height="h-8" />
                        <SkeletonLine width="w-3/4" className="mt-2" />
                        <SkeletonLine width="w-48" height="h-12" className="mt-4 rounded-full" />
                    </SkeletonCard>
                    <SkeletonCard className="p-6">
                        <SkeletonLine width="w-1/3" height="h-6" className="mb-4" />
                        <div className="space-y-4">
                           <SkeletonLine height="h-16" />
                           <SkeletonLine height="h-16" />
                           <SkeletonLine height="h-16" />
                        </div>
                    </SkeletonCard>
                </div>
            </main>
        </div>
    );
};