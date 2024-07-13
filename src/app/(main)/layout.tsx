import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AddressLayout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="container flex-1 space-y-4 p-8 pt-8">{children}</main>
      <Footer />
    </>
  );
}
