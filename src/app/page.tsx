"use client";
import Image from "next/image";
import ImageCarousel from "../components/ImageCarousel"; // Import the carousel component
import { useActionState } from 'react'; // Import useActionState from React
import { useFormStatus } from 'react-dom'; // Import hooks for form state
import { sendEmail, FormState } from './actions'; // Import the server action and type

// Define initial state for the form
const initialState: FormState = {
  message: '',
  success: false,
};

// Submit button component to show pending state
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Envoi en cours...' : 'Envoyer la demande'}
    </button>
  );
}

export default function Home() {
  const [state, formAction] = useActionState(sendEmail, initialState);

  return (
    <main className="bg-slate-900 text-slate-100 font-sans">
      {/* Header Placeholder - Ideally, this would be in layout.tsx */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-slate-700/65 backdrop-blur-xl shadow-md px-20">
        <nav className="container mx-auto h-20 py-1 flex justify-between items-center">
          <a className="h-full flex items-center gap-4 " href="#hero">
            <Image src="/logo.png" alt="Gatsun Logo" width={64} height={64} className="translate-y-0.5"/>
            <span className="text-2xl font-bold text-white">Gatsun</span>
          </a>
          <div className="h-full flex flex-row gap-10 justify-center items-center">
          <a
            href="#about"
            className="h-full flex items-center hover:text-orange-400 transition duration-100 active:text-white "
          >
            À propos
          </a>
          <a
            href="#services"
            className="h-full flex items-center hover:text-orange-400 transition duration-100 active:text-white "
          >
            Services
          </a>
          <a
            href="#pricing"
            className="h-full flex items-center hover:text-orange-400 transition duration-100 active:text-white "
          >
            Tarifs
          </a>
          <a
            href="#contact"
            className="h-full flex items-center hover:text-orange-400 transition duration-100 active:text-white "
          >
            Contact
          </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline 
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Your browser does not support the video.
        </video>

        <div className="absolute inset-0 bg-black opacity-70 z-1 motion-bg-in-background"></div>
        <div className="relative z-10 px-4 motion-blur-in-sm motion-duration-1500 motion-preset-slide-down-md">
          <h1 className="motion-ty text-5xl md:text-7xl font-bold text-white mb-4">
            Votre studio d&apos;enregistrement à Lyon
          </h1>
          <p className="text-xl text-slate-300 mb-8 ">
            Donnez vie à votre musique, à un tarif étudiant.
          </p>
          <a
            href="#contact"
            className="inline-block bg-orange-600 active:bg-orange-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 hover:-translate-y-1 active:translate-y-0"
          >
            Réserver un créneau
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-20 container mx-auto scroll-mt-20">
        <h2 className="text-4xl font-bold text-center mb-12 text-orange-500 ">À Propos de Gatsun</h2>
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="intersect:motion-preset-slide-right-sm">
            <h3 className="text-2xl font-semibold mb-6 ">Le studio de musique par des étudiants</h3>
            <p className="mb-6 ">
              Gatsun est un <span className="font-bold text-orange-500">studio d&apos;enregistrement</span> et de composition unique, géré par une équipe passionnée d&apos;étudiants de l&apos;INSA Lyon. Notre mission : offrir <span className="font-bold text-orange-500">un espace créatif de qualité accessible à tous</span>, en particulier aux étudiants et aux jeunes artistes.
            </p>
            <p className="font-semibold ">Nos points forts :</p>
            <ul className="list-none mt-2 space-y-1">
              <li className="ml-4">✓ Encadrement par des passionnés</li>
              <li className="ml-4">✓ Tarifs attractifs adaptés aux budgets étudiants</li>
              <li className="ml-4">✓ Matériel d&apos;enregistrement d&apos;exellente qualité</li>
              <li className="ml-4">✓ Ambiance conviviale et créative</li>
            </ul>
          </div>
          <div className="intersect:motion-preset-slide-left-sm">
            <ImageCarousel images={["/carousel_3.jpg", "/carousel_2.jpg", "/carousel_1.jpg"]} />
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-20 bg-slate-800 scroll-mt-20">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Nos Services</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
            <div className="bg-slate-700/65 intersect:motion-preset-slide-up-sm backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-600/65 transition duration-300">
              <div className="text-4xl mb-4 text-orange-500">🎤</div>
              <h3 className="text-xl font-semibold mb-2">Enregistrement</h3>
              <p className="text-sm text-slate-400">Prise de son voix et instruments en cabine traitée</p>
            </div>
             <div className="bg-slate-700/65 intersect:motion-preset-slide-up-sm motion-delay-100 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-600/65 transition duration-300">
              <div className="text-4xl mb-4 text-orange-500">🎚️</div>
              <h3 className="text-xl font-semibold mb-2">Mixage</h3>
              <p className="text-sm text-slate-400">Équilibrage et traitement de votre projet pour un rendu qualitatif</p>
            </div>
             <div className="bg-slate-700/65 intersect:motion-preset-slide-up-sm motion-delay-200 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-600/65 transition duration-300">
              <div className="text-4xl mb-4 text-orange-500">🎧</div>
              <h3 className="text-xl font-semibold mb-2">Mastering</h3>
              <p className="text-sm text-slate-400">Finalisation de votre morceau pour une diffusion optimale sur les plateformes</p>
            </div>
             <div className="bg-slate-700/65 intersect:motion-preset-slide-up-sm motion-delay-300 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-600/65 transition duration-300">
              <div className="text-4xl mb-4 text-orange-500">🎼</div>
              <h3 className="text-xl font-semibold mb-2">Composition</h3>
              <p className="text-sm text-slate-400">Aide à la création musicale et arrangements - Mise à disposition de notre clavier MIDI</p>
            </div>
             <div className="bg-slate-700/65 intersect:motion-preset-slide-up-sm motion-delay-400 backdrop-blur-xl p-6 rounded-xl shadow-lg hover:-translate-y-1 hover:bg-slate-600/65 transition duration-300">
              <div className="text-4xl mb-4 text-orange-500">🧑‍🏫</div>
              <h3 className="text-xl font-semibold mb-2">Conseils</h3>
              <p className="text-sm text-slate-400">Accompagnement personnalisé, pour vous permettre de donner le meilleur de vous-mêmes</p>
            </div>
            {/* Add more service cards here */}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-20 container mx-auto scroll-mt-20"> {/* Added scroll-mt-20 */}
        <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Nos Tarifs</h2>
        <div className="overflow-x-auto">
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
              <tr className="hover:bg-slate-800/50">
                <td className="p-4 border border-slate-700 font-semibold">Enregistrement</td>
                <td className="p-4 border border-slate-700"><span className="intersect:motion-scale-loop-100 intersect:motion-loop-twice inline-block">15 €/h</span></td>
                <td className="p-4 border border-slate-700 text-orange-400"><span className="intersect:motion-scale-loop-100 intersect:motion-loop-twice inline-block">8 €/h</span></td>
                <td className="p-4 border border-slate-700">Enregistrement de votre morceau au studio, avec un ingé son étudiant</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-4 border border-slate-700 font-semibold">Podcast</td>
                <td className="p-4 border border-slate-700">7,50 €/demi-heure</td>
                <td className="p-4 border border-slate-700 text-orange-400">4 €/demi-heure</td>
                <td className="p-4 border border-slate-700">Idéal pour une exellente qualité sonore pour votre podcast</td>
              </tr>
              <tr className="hover:bg-slate-800/50">
                <td className="p-4 border border-slate-700 font-semibold">Mixage / Mastering</td>
                <td className="p-4 border border-slate-700">10 €**</td>
                <td className="p-4 border border-slate-700 text-orange-400">20 €**</td>
                <td className="p-4 border border-slate-700">Finalisation de votre morceau par un de nos membres</td>
              </tr>
               <tr className="hover:bg-slate-800/50">
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
            className="bg-orange-600 active:bg-orange-700 inline-block hover:-translate-y-1 active:translate-y-0 text-white font-bold py-3 px-8 rounded-full transition duration-300"
          >
            Demander un devis personnalisé
          </a>
        </div>


        <p className="mt-12 text-sm text-slate-400">*Tarif applicable sur présentation de la carte VAvantage uniquement.</p>
        <p className="text-sm text-slate-400">**Tarif indicatif pour un morceau.</p>

      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-20 bg-slate-800 scroll-mt-20"> {/* Added scroll-mt-20 */}
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-orange-500">Contact & Réservation</h2>

          <div className="grid md:grid-cols-2 gap-16 mt-10">

            {/* Contact Info & Map */}
            <div className="intersect:motion-preset-slide-right-sm">
              <h3 className="text-2xl font-semibold mb-6">Comment prendre rendez-vous ?</h3>

                <p className="mb-2">Pour réserver un créneau ou pour n&apos;importe quelle question, vous pouvez nous contacter par e-mail, par Instagram, ou via le formulaire ci-contre. </p>
                <p className="mb-2">Décrivez-nous rapidement votre projet et vos disponibilités, et nous vous répondrons le plus rapidement possible !</p>
                <p className="mb-2">Étant une association étudiante, les créneaux sont de préférence les jeudis après-midi, les week-ends ou les soirs après 18h.</p>

                

                <h3 className="text-2xl font-semibold mb-6 mt-10">Nous trouver</h3>
                {/* Google Maps Embed */}
                <div className="h-64 rounded-xl overflow-hidden"> 
                  <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19847.53917624257!2d4.856409244244502!3d45.77915090235349!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4c1f6e749a53f%3A0xeeca76a88d567bf3!2sStudio%20Gatsun!5e1!3m2!1sfr!2sfr!4v1744914392730!5m2!1sfr!2sfr" 
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

            <div className="intersect:motion-preset-slide-left-sm">
              <h3 className="text-2xl font-semibold mb-6">Nous Contacter</h3>

              <div className="flex items-center gap-4 mb-2"> 
                <Image src="/mail.svg" alt="Email" width={32} height={32}/>
                <a href="mailto:contact@gatsun.asso-insa-lyon.fr" className="hover:text-orange-400 font-bold">contact@gatsun.asso-insa-lyon.fr</a>
              </div>

              <div className="flex items-center gap-4 mb-2"> 
                <Image src="/instagram.svg" alt="Email" width={32} height={32}/>
                <a href="https://instagram.com/gatsun_records" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 font-bold">@gatsun_records</a>
              </div>

              <div className="flex items-center my-8 max-w-256 mx-auto">
                <div className="flex-grow h-px bg-slate-700"></div>
                <span className="mx-4 text-slate-500 font-semibold">OU</span>
                <div className="flex-grow h-px bg-slate-700"></div>
              </div>

              <form action={formAction}> {/* Use the server action */}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium mb-1">Nom<span className="text-orange-500">*</span></label>
                  <input type="text" id="name" name="name" required className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-orange-500"/>
                  {state.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name.join(', ')}</p>}
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email<span className="text-orange-500">*</span></label>
                  <input type="email" id="email" name="email" required className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-orange-500"/>
                   {state.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email.join(', ')}</p>}
                </div>
                 <div className="mb-4">
                  <label htmlFor="availability" className="block text-sm font-medium mb-1">Quelles sont vos disponibilités ?</label> {/* Changed id/name to availability */}
                  <input type="text" id="availability" name="availability" className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-orange-500"/> {/* Changed id/name to availability */}
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium mb-1">Quel est votre projet ?<span className="text-orange-500">*</span></label>
                  <textarea id="message" name="message" rows={4} required className="w-full p-2 rounded bg-slate-700 border border-slate-600 focus:outline-none focus:border-orange-500"></textarea>
                   {state.errors?.message && <p className="text-red-500 text-xs mt-1">{state.errors.message.join(', ')}</p>}
                </div>
                <SubmitButton /> {/* Use the custom submit button */}
                {state.message && (
                  <p className={`mt-4 text-sm ${state.success ? 'text-green-500' : 'text-red-500'}`}>
                    {state.message}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Placeholder - Ideally, this would be in layout.tsx */}
      <footer className="bg-slate-900 py-8 px-4 text-center text-slate-500 text-sm">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} Gatsun. Tous droits réservés.</p>
           <p>Développé par des étudiants de l&apos;INSA Lyon.</p>
        </div>
      </footer>
    </main>
  );
}
