export default function PricingSection() {
  return (
    <section id="pricing" className="bg-slate-950 py-20 px-8 md:px-20 container mx-auto scroll-mt-20"> {/* Added scroll-mt-20 */}
      <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Nos Tarifs</h2>

      {/* Pricing Cards for Mobile */}
      <div className="block md:hidden space-y-6">
        {/* Enregistrement Card */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">Enregistrement</h3>
          <p className="mb-2"><span className="font-semibold">Tarif Standard:</span> 15 €/h</p>
          <p className="mb-4 text-orange-500"><span className="font-semibold">Tarif VAvantage*:</span> 8 €/h</p>
          <p className="text-sm text-slate-400">Enregistrement de votre morceau au studio, avec un ingé son étudiant.</p>
        </div>

        {/* Podcast Card */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">Podcast</h3>
          <p className="mb-2"><span className="font-semibold">Tarif Standard:</span> 7,50 €/demi-heure</p>
          <p className="mb-4 text-orange-500"><span className="font-semibold">Tarif VAvantage*:</span> 4 €/demi-heure</p>
          <p className="text-sm text-slate-400">Idéal pour une excellente qualité sonore pour votre podcast.</p>
        </div>

        {/* Mixage / Mastering Card */}
        <div className="bg-slate-800 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold mb-3 text-white">Mixage / Mastering</h3>
          <p className="mb-2"><span className="font-semibold">Tarif Standard:</span> 10 €**</p>
          <p className="mb-4 text-orange-500"><span className="font-semibold">Tarif VAvantage*:</span> 20 €**</p>
          <p className="text-sm text-slate-400">Finalisation de votre morceau par un de nos membres.</p>
        </div>
      </div>

      {/* Pricing Table for Medium and Larger Screens */}
      <div className="hidden md:block overflow-x-auto"> {/* Hide on small screens, show on md+ */}
        <table className="w-full min-w-[600px] text-left border-collapse">
          <thead>
            <tr className="bg-slate-800">
              <th className="p-4 border border-slate-700">Prestation</th>
              <th className="p-4 border border-slate-700">Tarif Standard</th>
              <th className="p-4 border border-slate-700">Tarif VAvantage*</th>
              <th className="p-4 border border-slate-700">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-slate-800/50 transition duration-300">
              <td className="p-4 border border-slate-700 font-semibold">Enregistrement</td>
              <td className="p-4 border border-slate-700"><span className="md:intersect:motion-scale-loop-100 md:intersect:motion-loop-twice inline-block">15 €/h</span></td>
              <td className="p-4 border border-slate-700 text-orange-500"><span className="md:intersect:motion-scale-loop-100 md:intersect:motion-loop-twice inline-block">8 €/h</span></td>
              <td className="p-4 border border-slate-700">Enregistrement de votre morceau au studio, avec un ingé son étudiant</td>
            </tr>
            <tr className="hover:bg-slate-800/50 transition duration-300">
              <td className="p-4 border border-slate-700 font-semibold">Podcast</td>
              <td className="p-4 border border-slate-700">7,50 €/demi-heure</td>
              <td className="p-4 border border-slate-700 text-orange-500">4 €/demi-heure</td>
              <td className="p-4 border border-slate-700">Idéal pour une exellente qualité sonore pour votre podcast</td>
            </tr>
            <tr className="hover:bg-slate-800/50 transition duration-300">
              <td className="p-4 border border-slate-700 font-semibold">Mixage / Mastering</td>
              <td className="p-4 border border-slate-700">10 €**</td>
              <td className="p-4 border border-slate-700 text-orange-500">20 €**</td>
              <td className="p-4 border border-slate-700">Finalisation de votre morceau par un de nos membres</td>
            </tr>
             <tr className="hover:bg-slate-800/50 transition duration-300">
              <td className="p-4 border border-slate-700 font-semibold">Captation - Événements extérieurs</td>
              <td colSpan={3} className="p-4 border border-slate-700 text-center">Sur devis</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center my-10 max-w-256 mx-auto">
        <div className="flex-grow h-px bg-slate-700"></div>
        <span className="mx-4 text-slate-500 font-semibold">OU</span>
        <div className="flex-grow h-px bg-slate-700"></div>
      </div>

      <div className="text-center mt-8">
         <a
          href="#contact"
          className="bg-orange-600 active:bg-orange-700 w-full md:w-auto inline-block hover:-translate-y-1 active:translate-y-0 text-white font-bold py-3 px-8 rounded-full transition duration-300"
        >
          Demander un devis personnalisé
        </a>
      </div>


      <p className="mt-12 text-sm text-slate-400">*Tarif applicable sur présentation de la carte VAvantage de l&apos;INSA Lyon uniquement.</p>
      <p className="text-sm text-slate-400">**Tarif indicatif pour un morceau.</p>

    </section>
  );
}