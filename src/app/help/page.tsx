"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HelpPage() {
  const router = useRouter();

  const handleTestService = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#FFF9F1] py-12 px-4 relative">
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <h1 className="text-4xl font-bold text-center text-[#401db2] mb-4 font-instrument">
          Så här fungerar Vibbla
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-center text-[#401db2] mb-12 font-inter max-w-3xl mx-auto">
          Promenera runt, lyssna på berättelser från andra och lämna kvar dina
          egna minnen för framtiden.
        </p>

        {/* Four Sections */}
        <div className="space-y-2">
          {/* Section 1 */}
          <div className="bg-[#401db2] rounded-xl p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/Vector.png"
                alt="Explore map icon"
                width={48}
                height={48}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 font-instrument">
                Utforska kartan
              </h3>
              <p className="text-white/90 font-inter">
                Se platser markerade med pinnar där varje pin är en berättelse.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-[#401db2] rounded-xl p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/mdi_unlocked-outline.png"
                alt="Go to location icon"
                width={48}
                height={48}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 font-instrument">
                Gå till platsen
              </h3>
              <p className="text-white/90 font-inter">
                När du är nära låses ljudklippet upp och du kan lyssna.
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-[#401db2] rounded-xl p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/bla 1.png"
                alt="Listen and experience icon"
                width={48}
                height={48}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 font-instrument">
                Lyssna & upplev
              </h3>
              <p className="text-white/90 font-inter">
                Sätt i hörlurarna och ta del av berättelser, minnen och ljud
                från platsen.
              </p>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-[#401db2] rounded-xl p-6 flex items-center gap-6">
            <div className="flex-shrink-0">
              <Image
                src="/guide_icon_4 1.png"
                alt="Share your story icon"
                width={48}
                height={48}
                className="object-contain filter brightness-0 invert"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2 font-instrument">
                Dela din berättelse
              </h3>
              <p className="text-white/90 font-instrument font-semibold">
                Tryck på &ldquo;Har du en historia du vill dela?&rdquo; för att
                lämna kvar ditt eget minne som andra kan upptäcka.
              </p>
            </div>
          </div>
        </div>

        {/* Test Service Button - Under and to the right of last section */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleTestService}
            className="bg-[var(--red)] hover:bg-[var(--dark-red)] font-instrument  text-white font-semibold px-4 rounded-[0.80556rem] transition-colors shadow-lg flex items-center gap-4"
          >
            <span className=" py-4">⬅ Tillbaka</span>
          </button>
        </div>
      </div>
    </div>
  );
}
