export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Cargando...
        </h2>
        <p className="text-gray-600">
          Preparando tu experiencia
        </p>
      </div>
    </div>
  );
}
