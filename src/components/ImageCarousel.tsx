"use client"; // Required for hooks like useEmblaCarousel

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';

interface ImageCarouselProps {
  images: string[];
  options?: Parameters<typeof useEmblaCarousel>[0];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, options }) => {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, ...options },
    [Autoplay({ delay: 5000 })] 
  );

  return (
    <div className="overflow-hidden rounded-lg" ref={emblaRef}>
      <div className="flex">
        {images.map((src, index) => (
          <div className="relative flex-[0_0_100%] aspect-video" key={index}>
            <Image
              src={src}
              alt={`Carousel image ${index + 1}`}
              fill 
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
