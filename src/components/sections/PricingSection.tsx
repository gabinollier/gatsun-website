import { getPricingData } from '@/actions/pricingActions';
import PricingCards from '@/components/PricingCards';

export default async function PricingSection() {
  const pricingData = await getPricingData();

  return (
    <section id="pricing" className="bg-slate-950 py-20 px-8 md:px-20 container scroll-mt-20 mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16 text-orange-500">Nos Tarifs</h2>
      <PricingCards services={pricingData.services} footnotes={pricingData.footnotes} />
    </section>
  );
}