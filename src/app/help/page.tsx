export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Hjälpcenter
        </h1>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Vanliga frågor
            </h2>

            <div className="space-y-4">
              <details className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                  Hur spelar jag in ljud?
                </summary>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Klicka på &ldquo;Har du en historia du vill dela?&rdquo;
                  knappen på startsidan. Tillåt mikrofonåtkomst och börja spela
                  in.
                </p>
              </details>

              <details className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                  Varför behöver ni min plats?
                </summary>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Vi använder din plats för att placera din ljudinspelning på
                  rätt ställe på kartan så andra kan hitta den.
                </p>
              </details>

              <details className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <summary className="font-medium text-gray-900 dark:text-gray-100 cursor-pointer">
                  Hur lång tid tar det innan mitt ljud publiceras?
                </summary>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  All innehåll modereras manuellt. Det tar vanligtvis 24-48
                  timmar innan ditt ljud blir synligt på kartan.
                </p>
              </details>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Behöver du mer hjälp?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Kontakta oss på support@vibbla.se så hjälper vi dig!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
