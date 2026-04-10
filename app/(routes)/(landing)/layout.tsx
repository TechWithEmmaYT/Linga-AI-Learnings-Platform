import { Footer } from "@/components/footer";
import Header from "@/components/header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center">{children}</main>
      <Footer />
    </div>
  );
}
