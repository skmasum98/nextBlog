import Sidebar from "@/components/Sidebar";

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