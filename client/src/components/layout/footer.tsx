import { Link } from "wouter";

export default function Footer() {
  const currentYear = 2025;

  return (
      <footer className="bg-neutral-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="mt-4 pt-4 border-t border-neutral-800 text-center text-neutral-400">
            <p>© {currentYear} StayEase. Усі права захищені.</p>
          </div>
        </div>
      </footer>
  );
}