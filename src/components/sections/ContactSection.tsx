import Image from "next/image";
import ContactForm from '@/components/ContactForm'; 

export default function ContactSection() {
  return (
    <section className="py-20 px-8 md:px-20 bg-slate-900 scroll-mt-20"> {/* Added scroll-mt-20 */}
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Contact & Réservation</h2>

        <div className="grid md:grid-cols-2 gap-16 mt-10">

          {/* Contact Info & Map */}
          <div className="intersect-once md:intersect:motion-preset-slide-right-sm">
            <h3 className="text-2xl font-semibold mb-6">Comment prendre rendez-vous ?</h3>

              <p className="mb-4">Pour réserver un créneau ou pour n&apos;importe quelle question, vous pouvez nous contacter par <span className="font-bold text-orange-500">e-mail</span>, par <span className="font-bold text-orange-500">Instagram</span>, ou via le <span className="font-bold text-orange-500">formulaire</span> de ce site. </p>
              <p className="mb-4">Décrivez-nous rapidement votre projet et vos disponibilités, et nous vous répondrons le plus rapidement possible !</p>
              <p className="mb-4">Étant une association étudiante, les créneaux sont de préférence les jeudis après-midi, les week-ends ou les soirs après 18h.</p>



              <h3 className="text-2xl font-semibold mb-6 mt-10">Nous trouver</h3>
              {/* Google Maps Embed */}
              <div className="h-64 rounded-xl overflow-hidden">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d11129.367391309086!2d4.873030729179708!3d45.78437872623983!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4c1f6e749a53f%3A0xeeca76a88d567bf3!2sStudio%20Gatsun!5e0!3m2!1sfr!2sfr!4v1744979927284!5m2!1sfr!2sfr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Gatsun Studio Location"
                ></iframe>
              </div>
             <a href="https://www.google.com/maps/place/Studio+Gatsun/@45.7881387,4.8636957,4301m/data=!3m1!1e3!4m6!3m5!1s0x47f4c1f6e749a53f:0xeeca76a88d567bf3!8m2!3d45.7840159!4d4.8799093!16s%2Fg%2F11gtg89kh4?hl=fr&entry=ttu&g_ep=EgoyMDI1MDQxNC4xIKXMDSoASAFQAw%3D%3D" className="mt-2 text-sm text-slate-400">5 Rue des Sciences, 69100 Villeurbanne (INSA Lyon - Campus LyonTech La Doua)</a>
          </div>

          <div className="intersect-once md:intersect:motion-preset-slide-left-sm">
            <h3 id="contact" className="text-2xl font-semibold mb-6 scroll-mt-32 md:scroll-mt-54">Nous Contacter</h3>

            <div className="flex items-center gap-4 mb-2">
              <Image src="/mail.svg" alt="Email" width={32} height={32}/>
              <a href="mailto:contact@gatsun.asso-insa-lyon.fr" className="hover:text-orange-500 font-bold">contact@gatsun.asso-insa-lyon.fr</a>
            </div>

            <div className="flex items-center gap-4 mb-2">
              <Image src="/instagram.svg" alt="Instagram" width={32} height={32}/> {/* Corrected alt text */}
              <a href="https://instagram.com/gatsun_records" target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 font-bold">@gatsun_records</a>
            </div>

            <div className="flex items-center my-8 max-w-256 mx-auto">
              <div className="flex-grow h-px bg-slate-700"></div>
              <span className="mx-4 text-slate-500 font-semibold">OU</span>
              <div className="flex-grow h-px bg-slate-700"></div>
            </div>

            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}