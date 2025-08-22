import React from "react";
import Image from "next/image";

interface HeroSectionProps {
  onTestService: () => void;
  onLearnMore: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  onTestService,
  onLearnMore,
}) => {
  return (
    <div className="relative min-h-screen flex items-center justify-start overflow-hidden">
      {/* Background Image with Overlay - Single Container */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/hero-background.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "right center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Dark overlay directly as a pseudo-element equivalent */}
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight font-instrument">
            Upptäck Lindholmen genom delade röstminnen
          </h1>

          {/* Description */}
          <div className="mb-12">
            <p className="text-lg sm:text-xl text-gray-100 leading-relaxed font-inter">
              Promenera runt, lyssna på berättelser från andra och lämna kvar
              dina egna minnen för framtiden.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Test Service Button */}
            <button
              onClick={onTestService}
              className="bg-[var(--red)] hover:bg-[var(--dark-red)] font-instrument  text-white font-semibold px-4 rounded-[0.80556rem] transition-colors shadow-lg flex items-center gap-4"
            >
              <span className=" py-4">Testa Tjänsten</span>
              <Image
                src="/hero-recording-icon.svg"
                alt="Recording icon"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
            </button>

            {/* Learn More Button */}
            <button
              onClick={onLearnMore}
              className="bg-[var(--blue)] hover:bg-[var(--dark-blue)] text-white font-semibold py-4 px-4 rounded-[0.80556rem] transition-colors shadow-lg flex items-center gap-3 font-instrument"
            >
              <span>Så här fungerar Vibbla</span>
            
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
