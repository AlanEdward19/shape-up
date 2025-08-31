import shapeUpLogo from "@/images/shape_up.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
      <div
          className="flex min-h-screen w-full text-[#e8ecf8]"
          style={{
            background:
                "radial-gradient(1200px 600px at 10% -10%, #1b2437 0, transparent 60%), #0f1420",
          }}
      >
        {/* Left side - Branding (tons de cinza, logo maior, slogan mais aparente) */}
        <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
          {/* Camada base em cinza/graphite */}
          <div
              className="absolute inset-0"
              style={{
                background:
                    "linear-gradient(135deg, #151a24 0%, #1b2230 45%, #202838 100%)",
              }}
          />

          {/* Textura sutil em cinza (pouco intrusiva) */}
          <div
              className="absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                    "radial-gradient(rgba(203,213,225,.25) 1px, transparent 1.3px)",
                backgroundSize: "20px 20px",
              }}
          />

          {/* Borda suave para separar as colunas */}
          <div className="absolute top-0 right-0 h-full w-px bg-white/10" />

          {/* Conteúdo */}
          <div className="relative z-10 flex flex-col justify-center p-16 mx-auto max-w-2xl">
            <h1 className="text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              ShapeUp
            </h1>

            {/* Slogan com mais presença/contraste */}
            <p className="mt-6 text-2xl leading-relaxed text-gray-200/95">
              Transforme sua rotina, conecte-se com sua evolução.{" "}
              <span className="text-gray-100">
              Nutrição, treinos e amizades em um só lugar.
            </span>
            </p>

            {/* Logo maior, mantendo o mesmo arquivo */}
            <img
                src={shapeUpLogo}
                alt="ShapeUp Logo"
                className="mx-auto mt-10 w-64 h-auto md:w-72 lg:w-80"
            />

            {/* Linha sutil para fechamento visual */}
            <div className="mt-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>

        {/* Right side - Content (inalterado) */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
  );
};

export default AuthLayout;
