export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
            Viajero Conectado
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto">
            Red social + marketplace de viajes
          </p>

          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Descubre, conecta y viaja con quienes ya estuvieron allí
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Explorar destinos
            </button>
            <button className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-medium">
              Registrarse
            </button>
          </div>

          <div className="pt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold mb-2">Marketplace</h3>
              <p className="text-gray-600 text-sm">
                Tours, hoteles, guías y experiencias únicas
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-semibold mb-2">Red Social</h3>
              <p className="text-gray-600 text-sm">
                Comparte tus viajes y conecta con otros viajeros
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-lg font-semibold mb-2">Puntos</h3>
              <p className="text-gray-600 text-sm">
                Gana recompensas por cada viaje y actividad
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
