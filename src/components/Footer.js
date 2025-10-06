// src/components/Footer.js

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner mt-16">
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-sm text-gray-600">
          &copy; {currentYear} THEWEBPAL. All Rights Reserved. | Developed by{' '}
          <a
            href="https://thewebpal.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-indigo-600 hover:underline"
          >
            The Web Pal
          </a>
          .
        </p>
      </div>
    </footer>
  );
}