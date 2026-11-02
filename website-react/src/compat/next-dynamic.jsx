import React from 'react';

export default function dynamic(importFn, options = {}) {
  const LazyComponent = React.lazy(importFn);
  const Loading = options.loading || (() => null);

  return function DynamicComponent(props) {
    return (
      <React.Suspense fallback={<Loading />}>
        <LazyComponent {...props} />
      </React.Suspense>
    );
  };
}
