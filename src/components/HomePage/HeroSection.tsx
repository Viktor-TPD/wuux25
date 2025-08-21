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
              className="bg-[#b6163a] hover:bg-[#9d1331] text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-3 w-full max-w-xs font-inter"
            >
              <span>Testa Tjänsten</span>
              <Image
                src="/success-icon.svg"
                alt="Success icon"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
            </button>

            {/* Learn More Button */}
            <button
              onClick={onLearnMore}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-4 px-6 rounded-lg transition-colors shadow-lg flex items-center gap-3 w-full max-w-xs font-inter"
            >
              <span>Så här fungerar Vibbla</span>
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
