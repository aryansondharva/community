import React from 'react';
import '../styles/Gallery.css';

const Gallery = () => {
  const images = [
    { src: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=70', alt: 'bank' },
    { src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=70', alt: 'code' },
    { src: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=70', alt: 'cyber' },
    { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70', alt: 'circuit' },
    { src: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=70', alt: 'hack' }
  ];

  return (
    <div className="gallery-strip">
      <div className="g-track">
        {images.concat(images).map((img, index) => (
          <img key={index} src={img.src} alt={img.alt} />
        ))}
      </div>
    </div>
  );
};

export default Gallery;
