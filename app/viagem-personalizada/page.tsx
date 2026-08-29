import { Bodoni_Moda } from "next/font/google";
import { CartProvider } from "../components/CartContext";
import { CartWidget } from "../components/CartWidget";
import { CustomPackageCard } from "../components/CustomPackageCard";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: "Ajisai | Viagem Personalizada",
  description:
    "Crie uma viagem ao Japão do zero, com roteiro, serviços e organização inteiramente sob medida.",
};

export default function ViagemPersonalizadaPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-black pb-16 text-white">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
            <img
              src="/images/AJISAI-LOGO.avif"
              alt="Ajisai"
              className="h-9 w-auto object-contain md:h-10"
            />
            <CartWidget />
          </div>
        </header>

        <section className="border-b border-white/10 bg-white/[0.02] px-5 py-12 md:px-16 md:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 md:mb-14">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6ec3d9]">
                Criada do zero e organizada sob medida
              </p>
              <h1 className={`${display.className} mt-3 text-3xl font-medium leading-tight md:text-5xl`}>
                Viagem Personalizada
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-light leading-6 text-white/55 md:text-base md:leading-7">
                Viaje em qualquer data, com roteiro, reservas e serviços
                escolhidos inteiramente de acordo com você.
              </p>
            </div>

            <CustomPackageCard />
          </div>
        </section>
      </main>
    </CartProvider>
  );
}
