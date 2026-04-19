import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t border-border mt-20 py-14">
    <div className="container-editorial flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
      <div>
        <p className="font-serif text-2xl">Fourteen Days</p>
        <p className="eyebrow mt-2">A travel journal</p>
      </div>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()}</span>
        <Link to="/admin" className="hover:text-foreground transition-colors">
          Admin
        </Link>
      </div>
    </div>
  </footer>
);
