import Image from "next/image";

export default function Header() {
    return (
        <header className="border-b border-slate-100/10 fixed left-0 right-0 top-0 z-50 bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-black/30 px-8 md:px-20">
            <nav className="container mx-auto h-20 py-1 flex justify-between items-center">
              <a className="h-full flex items-center gap-4 " href="#hero">
                <Image src="/logo.png" alt="Gatsun Logo" width={64} height={64} className="translate-y-0.5"/>
                <span className="text-2xl font-bold text-white hidden md:inline drop-shadow-lg drop-shadow-white/20">Gatsun</span>
              </a>
              <div className="h-full flex flex-row gap-4 md:gap-10 justify-center items-center">

                {[{ href: "#about", text: "À propos" },
                  { href: "#services", text: "Services" },
                  { href: "#pricing", text: "Tarifs" },
                  { href: "#contact", text: "Contact" },
                ].map((section) => (
                  <a
                    key={section.href}
                    href={section.href}
                    className="h-full flex items-center hover:text-orange-400 transition duration-100 active:text-white "
                  >
                    {section.text}
                  </a>
                ))}
              </div>
            </nav>
          </header>
    );
}