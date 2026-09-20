export function LogoMark({ size = 64 }: { size?: number }) {
  return (
    <img
      className="altadawy-official-logo shrink-0"
      src="/altadawy-logo.jpg"
      alt="شعار مستشفى التداوي"
      width={size}
      height={size}
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}
