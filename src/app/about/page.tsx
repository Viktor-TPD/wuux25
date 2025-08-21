export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Såhär fungerar Vibbla
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2>Vad är Vibbla?</h2>
            <p>
              Vibbla är en platsbaserad ljuddelningsapp som låter dig upptäcka
              platser genom andras ljudminnen och dela dina egna berättelser.
            </p>

            <h2>Hur fungerar det?</h2>
            <ol>
              <li>
                <strong>Utforska kartan</strong> - Se ljudinspelningar från
                andra användare
              </li>
              <li>
                <strong>Lyssna på berättelser</strong> - Kom nära en markör för
                att lyssna
              </li>
              <li>
                <strong>Dela dina minnen</strong> - Spela in dina egna
                ljudberättelser
              </li>
              <li>
                <strong>Bygg community</strong> - Hjälp till att skapa en rik
                ljudkarta
              </li>
            </ol>

            <h2>Integritet och säkerhet</h2>
            <p>
              All innehåll modereras innan det publiceras. Vi respekterar din
              integritet och använder platsdata endast för att placera dina
              inspelningar på kartan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
