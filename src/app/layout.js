import Link from 'next/link';

import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';


export const metadata = {
  title: 'Next.js Blog Platform',
  description: 'A feature-rich blog built with Next.js and MongoDB',
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