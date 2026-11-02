import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function Link({ href, to, children, ...props }) {
  const target = to || href || '#';
  if (
    typeof target === 'string' &&
    (target.startsWith('http://') ||
      target.startsWith('https://') ||
      target.startsWith('mailto:') ||
      target.startsWith('tel:') ||
      target.startsWith('#'))
  ) {
    return (
      <a href={target} {...props}>
        {children}
      </a>
    );
  }
  return (
    <RouterLink to={target} {...props}>
      {children}
    </RouterLink>
  );
}
