import ImageCarousel from "@/components/ImageCarousel";

export default function AboutSection() {
  return (
    <section id="about" className="bg-slate-950 py-20 px-8 md:px-20 container mx-auto scroll-mt-20">
      <h2 className="text-4xl font-bold text-center mb-12 text-orange-500 ">À Propos de Gatsun</h2>
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <div className="md:intersect:motion-preset-slide-right-sm text-slate-200">
          <h3 className="text-2xl font-semibold mb-6 text-white">Le studio de musique par des étudiants</h3>
          <p className="mb-6 ">
            Gatsun est un <span className="font-bold text-orange-500">studio associatif</span>, géré par une équipe passionnée d&apos;étudiants de l&apos;INSA Lyon. Notre mission : offrir <span className="font-bold text-orange-500">un espace créatif de qualité accessible à tous</span>, en particulier aux étudiants et aux jeunes artistes.
          </p>
          <p className="font-semibold text-white">Nos points forts :</p>
          <ul className="list-none mt-2 space-y-1">
            <li className="ml-4">✓ Encadrement par des passionnés</li>
            <li className="ml-4">✓ Tarifs attractifs adaptés aux petits budgets</li>
            <li className="ml-4">✓ Matériel d&apos;enregistrement de qualité</li>
            <li className="ml-4">✓ Ambiance conviviale et créative</li>
          </ul>
        </div>
        <div className="md:intersect:motion-preset-slide-left-sm">
          <ImageCarousel images={["/carousel_5.jpg", "/carousel_4.jpg", "/carousel_1.jpg", "/carousel_6.jpg", "/carousel_2.jpg"]} />
        </div>
      </div>
    </section>
  );
}