import Navbar from "@/components/storefront/Navbar";
import Footer from "@/components/storefront/Footer";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
