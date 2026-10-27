import { PixelOpenAI } from "./PixelOpenAI";

// Layout de /empregos: só acrescenta o pixel da OpenAI (Wilson, 27/out/2026).
export default function EmpregosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PixelOpenAI />
      {children}
    </>
  );
}
