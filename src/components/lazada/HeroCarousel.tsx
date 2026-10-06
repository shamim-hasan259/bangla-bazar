'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const slides = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  },
  {
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=2070&auto=format&fit=crop",
    link: "#"
  }
];

const HeroCarousel = () => {
  return (
    <div className="w-full bg-[#f5f5f5] py-4">
      <div className="container mx-auto px-4">
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="rounded-sm overflow-hidden h-[344px]"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <a href={slide.link}>
                <img src={slide.image} alt={`Slide ${index}`} className="w-full h-full object-cover" />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default HeroCarousel;
