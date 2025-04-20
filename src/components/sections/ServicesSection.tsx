export default function ServicesSection() {
  return (
    <section id="services" className="py-20 px-8 md:px-20 bg-slate-900 scroll-mt-20">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Nos Compétences</h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">

          {[{title: "Enregistrement", icon: "🎤", description: "Prise de son voix et instruments en cabine traitée"},
          {title: "Mixage", icon: "🎚️", description: "Équilibrage et traitement de votre projet pour un rendu qualitatif"},
          {title: "Mastering", icon: "🎧", description: "Finalisation de votre morceau pour une diffusion optimale sur les plateformes"},
          {title: "Composition", icon: "🎼", description: "Aide à la création musicale et arrangements - Mise à disposition de notre clavier MIDI"},
          {title: "Conseils", icon: "🧑‍🏫", description: "Accompagnement personnalisé, pour vous permettre de donner le meilleur de vous-mêmes"},]
          .map((service, index) => (
            <div key={index} className={`bg-slate-800 hover:shadow-orange-600/25 hover:shadow-2xl intersect-once  md:intersect:motion-preset-fade-md motion-delay-${index * 100} backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-700/65 transition duration-300`}>
              <div className="text-4xl mb-4 text-orange-500">{service.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
              <p className="text-sm text-slate-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}