import { IconMap, IconCar, IconPlane, IconTrain, IconFork } from "@/app/components/AirportGuideKit";

// Ícones extras usados apenas nos cards de produto do CRM — seguem o
// mesmo estilo (stroke, 24x24) dos ícones em AirportGuideKit.tsx.

function IconPencil({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function IconBuilding({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <rect x="8" y="7" width="2.2" height="2.2" />
      <rect x="13.8" y="7" width="2.2" height="2.2" />
      <rect x="8" y="12" width="2.2" height="2.2" />
      <rect x="13.8" y="12" width="2.2" height="2.2" />
      <rect x="10" y="17" width="4" height="4" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function IconUserCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="4" />
      <path d="M2 21c0-4 3.1-7 7-7s7 3 7 7" />
      <path d="M16.5 11.5 18.5 13.5 22 10" />
    </svg>
  );
}

function IconBag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function IconSteeringWheel({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.3" />
      <path d="M12 5v4.5M6.3 15.5l3.7-2M17.7 15.5l-3.7-2" />
    </svg>
  );
}

export const PRODUTO_ICONS: Record<string, (props: { className?: string }) => React.JSX.Element> = {
  // Produto principal
  roteiro_personalizado: IconMap,
  revisao_roteiro: IconPencil,
  caravana: IconCar,
  semi_full_service: IconPlane,
  full_service: IconBuilding,
  // Produto secundário
  jr_pass: IconTrain,
  seguro_viagem: IconShield,
  guia: IconUser,
  motorista_particular: IconSteeringWheel,
  reserva_restaurantes: IconFork,
  acompanhamento_restaurantes: IconUserCheck,
  acompanhamento_compras: IconBag,
};
