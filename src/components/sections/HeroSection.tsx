export default function HeroSection() {
  return (
    <section id="hero" className="relative h-screen flex items-center justify-center  text-center overflow-hidden">
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

      <div className="absolute inset-0 bg-black opacity-70 z-1  motion-opacity-in-100 motion-duration-1500"></div>
      <div className="relative z-10 px-8 md:px-20 motion-blur-in-sm motion-duration-1500 motion-preset-slide-up-md">
        <h1 className="text-4xl md:text-7xl font-bold text-white mb-4">
          Votre studio d&apos;enregistrement à Lyon
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-8 ">
          Donnez vie à votre musique, à un tarif étudiant.
        </p>
        <a
        href="#contact"
        className="relative overflow-hidden inline-block bg-orange-600 active:bg-orange-700 text-white md:w-auto w-full font-bold py-3 px-8 rounded-full text-lg transition duration-300 hover:-translate-y-1 active:translate-y-0 shadow-lg shadow-orange-600/40 before:content-[''] before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent before:skew-x-[-25deg] hover:before:translate-x-full before:transition-transform before:duration-1000"
        >
          Réserver un créneau
        </a>

      </div>
    </section>
  );
}