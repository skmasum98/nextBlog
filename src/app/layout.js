import Link from 'next/link';

import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import siteConfig from '@/lib/siteConfig';


export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'),
  title: `${siteConfig.name} - Next.js Blog Platform`,
  description: 'A feature-rich Thewebpal blog built with Next.js and MongoDB',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900 pt-8"> {/* Add padding-top to prevent content from hiding under the sticky header */}
        <Header /> 
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}