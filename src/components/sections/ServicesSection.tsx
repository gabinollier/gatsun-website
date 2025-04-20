export default function ServicesSection() {
  return (
    <section id="services" className="py-20 px-8 md:px-20 bg-slate-900 scroll-mt-20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Nos Services</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
          <div className="bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl md:intersect:motion-preset-fade-md backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300">
            <div className="text-4xl mb-4 text-orange-500">🎤</div>
            <h3 className="text-xl font-semibold mb-2">Enregistrement</h3>
            <p className="text-sm text-slate-400">Prise de son voix et instruments en cabine traitée</p>
          </div>
           <div className="bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl md:intersect:motion-preset-fade-md motion-delay-100 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300">
            <div className="text-4xl mb-4 text-orange-500">🎚️</div>
            <h3 className="text-xl font-semibold mb-2">Mixage</h3>
            <p className="text-sm text-slate-400">Équilibrage et traitement de votre projet pour un rendu qualitatif</p>
          </div>
           <div className="bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl md:intersect:motion-preset-fade-md motion-delay-200 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300">
            <div className="text-4xl mb-4 text-orange-500">🎧</div>
            <h3 className="text-xl font-semibold mb-2">Mastering</h3>
            <p className="text-sm text-slate-400">Finalisation de votre morceau pour une diffusion optimale sur les plateformes</p>
          </div>
           <div className="bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl md:intersect:motion-preset-fade-md motion-delay-300 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300">
            <div className="text-4xl mb-4 text-orange-500">🎼</div>
            <h3 className="text-xl font-semibold mb-2">Composition</h3>
            <p className="text-sm text-slate-400">Aide à la création musicale et arrangements - Mise à disposition de notre clavier MIDI</p>
          </div>
           <div className="bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl md:intersect:motion-preset-fade-md motion-delay-400 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300">
            <div className="text-4xl mb-4 text-orange-500">🧑‍🏫</div>
            <h3 className="text-xl font-semibold mb-2">Conseils</h3>
            <p className="text-sm text-slate-400">Accompagnement personnalisé, pour vous permettre de donner le meilleur de vous-mêmes</p>
          </div>
        </div>
      </div>
    </section>
  );
}