import Sidebar from "@/components/Sidebar";
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap', // shows fallback font instantly
});

export default function SiteLayout({ children }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        <main className="w-full lg:w-3/4">
          {children}
        </main>
        <Sidebar />
      </div>
    </div>
  );
}