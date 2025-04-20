export default function Header() {
    return (
        <footer className="bg-slate-950 py-8 px-4 text-center text-slate-500 text-sm">
            <div className="container mx-auto">
              <p>&copy; {new Date().getFullYear()} Gatsun. Tous droits réservés.</p>
              <p>Développé par des étudiants de l&apos;INSA Lyon.</p>
            </div>
        </footer>
    );
}