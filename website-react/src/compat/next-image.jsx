import React from 'react';

export default function Image({
  src,
  alt = '',
  width,
  height,
  className = '',
  priority,
  fill,
  style,
  ...props
}) {
  const combinedStyle = fill
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        ...style,
      }
    : style;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      style={combinedStyle}
      {...props}
    />
  );
}
