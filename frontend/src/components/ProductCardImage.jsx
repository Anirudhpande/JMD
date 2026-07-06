import React, { useState } from 'react';

export default function ProductCardImage({
  images,
  name,
  category,
  inStock,
  badgeText,
  aspectRatio = '1',
  objectFit = 'cover',
  padding = '0',
  className = '',
  style = {}
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const hasMultipleImages = images && images.length > 1;

  return (
    <div
      className={`product-image-wrapper ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setActiveIdx(0);
      }}
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        aspectRatio,
        backgroundColor: '#EBE4D9',
        ...style
      }}
    >
      {/* Images */}
      {images && images.map((imgUrl, idx) => {
        const isPng = imgUrl?.toLowerCase().endsWith('.png');
        const imgFit = idx === 0 ? (isPng ? 'contain' : objectFit) : 'cover';
        const imgPadding = idx === 0 ? (isPng ? padding || '1rem' : '0') : '0';

        return (
          <img
            key={idx}
            src={imgUrl}
            alt={`${name} - View ${idx + 1}`}
            className="product-image-cycle-item"
            style={{
              position: idx === 0 ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: imgFit,
              padding: imgPadding,
              boxSizing: 'border-box',
              opacity: idx === activeIdx ? 1 : 0,
              zIndex: idx === activeIdx ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'scale(1.03)' : 'scale(1)',
            }}
            loading="lazy"
            decoding="async"
          />
        );
      })}

      {/* Hover segments for switching images */}
      {hasMultipleImages && isHovered && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            zIndex: 10,
          }}
        >
          {images.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '100%',
                cursor: 'pointer',
              }}
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseMove={() => {
                if (activeIdx !== idx) {
                  setActiveIdx(idx);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Progress indicators (dashes) at the bottom */}
      {hasMultipleImages && (
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            gap: '6px',
            zIndex: 11,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.25s ease-in-out',
          }}
        >
          {images.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: '3px',
                backgroundColor: idx === activeIdx ? 'var(--color-accent, #C9A96E)' : 'rgba(255, 255, 255, 0.4)',
                borderRadius: '2px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                transition: 'background-color 0.2s ease',
              }}
            />
          ))}
        </div>
      )}

      {/* Badges */}
      {!inStock && (
        <span className="badge badge-out-of-stock" style={{ backgroundColor: 'var(--color-danger)', zIndex: 12 }}>
          Out of Stock
        </span>
      )}
      {badgeText && inStock && (
        <span className="badge badge-featured" style={{ zIndex: 12 }}>
          {badgeText}
        </span>
      )}
    </div>
  );
}
