import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 80, className }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Fundación Grítalo"
      width={size}
      height={size}
      className={className}
      priority
    />
  );
}

export function LogoWithText({
  size = 80,
  className,
}: LogoProps) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className || ""}`}>
      <Logo size={size} />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">
          Fundación Grítalo
        </h1>
        <p className="text-sm text-text-secondary mt-0.5">
          Gestión de Voluntariado
        </p>
      </div>
    </div>
  );
}
