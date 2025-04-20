import Image from 'next/image';

export default function PricingSection() {
  const services = [
    {
      title: "Enregistrement",
      price: "15 €",
      frequency: "/h",
      vAvantagePrice: "8 €",
      description: "Enregistrement de votre morceau au studio.",
      features: [
        { text: "Ingé son étudiant", included: true },
        { text: "Prise de voix", included: true },
        { text: "Prise d'instruments", included: true },
        { text: "Matériel de qualité", included: true },
        { text: "Cabine traitée", included: true },
        { text: "Mixage / Mastering", included: false },
      ],
      popular: true,
    },
    {
      title: "Podcast",
      price: "7,50 €",
      frequency: "/demi-heure",
      vAvantagePrice: "4 €",
      description: "Idéal pour une exellente qualité sonore.",
      features: [
        { text: "Configuration multi-micros", included: true },
        { text: "Enregistrement haute qualité", included: true },
        { text: "Mixage / Mastering", included: false },
      ],
      popular: false,
    },
    {
      title: "Mixage / Mastering",
      price: "20 €",
      frequency: "/morceau**",
      vAvantagePrice: "10 €", 
      description: "Finalisation de votre morceau par un de nos membres.",
      features: [
        { text: "Mixage multi-pistes", included: true },
        { text: "Mastering pour les plateformes de streaming", included: true },
        { text: "3 révisions incluses", included: true }, 
      ],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="bg-slate-950 py-20 px-8 md:px-20 container scroll-mt-20 mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16 text-orange-500">Nos Tarifs</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {services.map((service, index) => (
          <a 
            key={service.title}
            href="#contact" 
            className={`intersect-once md:intersect:motion-preset-fade-md motion-duration-1000 motion-delay-${index * 100} relative bg-slate-800 rounded-xl shadow-xl ring hover:ring-2 ring-slate-600 flex flex-col transition duration-300 ease-in-out transform hover:-translate-y-2 hover:shadow-orange-950 hover:ring-orange-500 cursor-pointer`} 
          >
            {service.popular ? (
              <span className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Populaire
              </span>
            ) : null}

            <div className="p-10 border-b border-slate-700 text-left">
              <h3 className="text-xl font-semibold mb-4 text-white">{service.title}</h3>
              <div className="mb-2"> 
                  <span className="text-4xl font-bold text-white">{service.price}</span>
                  <span className="text-sm text-slate-400 ml-1">{service.frequency}</span>
              </div>
              <div className="inline-block bg-orange-500/20 text-orange-400 text-xs font-semibold px-3 py-1 rounded-full">
                VAvantage*: {service.vAvantagePrice}{service.frequency}
              </div>
            </div>

            <div className="py-10 px-8 flex-grow">
              <p className="text-sm text-slate-400 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    {feature.included ? (
                      <Image src="/circle-check.svg" alt="Included" width={20} height={20} className="mr-2 flex-shrink-0" />
                    ) : (
                      <Image src="/circle-x.svg" alt="Not Included" width={20} height={20} className="mr-2 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-slate-300' : 'text-slate-500'}>{feature.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </a>
        ))}
      </div>

      <div className="flex items-center my-12 max-w-2xl mx-auto">
        <div className="flex-grow h-px bg-slate-700"></div>
        <span className="mx-4 text-slate-500 font-semibold">OU</span>
        <div className="flex-grow h-px bg-slate-700"></div>
      </div>

      <div className="text-center">
        <a
          href="#contact"
          className="bg-orange-600 active:bg-orange-700 w-full md:w-auto inline-block hover:-translate-y-1 active:translate-y-0 text-white font-bold py-3 px-8 rounded-full transition duration-300"
        >
          Demander un devis personnalisé
        </a>
      </div>

      <div className="text-left mt-12 text-sm text-slate-400">
        <p>*Tarif applicable sur présentation de la carte VAvantage de l&apos;INSA Lyon uniquement.</p>
        <p>**Tarif indicatif, peut varier selon la complexité du projet.</p>
      </div>
    </section>
  );
}