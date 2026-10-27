import { PixelOpenAI } from "../empregos/PixelOpenAI";

// Página institucional da campanha (ChatGPT Ads) — mesmo pixel de /empregos.
export default function TrabalharNoJapaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PixelOpenAI />
      {children}
    </>
  );
}
