const BrandLogo = ({ light = false, className = '' }: { light?: boolean; className?: string }) => (
  <img
    src={`/brand/pbex-${light ? 'white' : 'color'}.png`}
    alt="PBEX · Plásticos Básicos de Exportación S.A.C."
    width="400"
    height="154"
    className={`brand-logo ${className}`}
  />
);

export default BrandLogo;
