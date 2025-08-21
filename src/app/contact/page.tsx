export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          Kontakta oss
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Vi hjälper gärna till! Kontakta oss om du har frågor eller behöver
            support.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                support@vibbla.se
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                Telefon
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                +46 123 456 789
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
