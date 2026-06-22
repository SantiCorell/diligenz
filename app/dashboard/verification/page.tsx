import DniUploadForm from "@/components/verification/DniUploadForm";

export default function DashboardVerificationPage() {
  return (
    <div className="max-w-3xl mx-auto rounded-2xl bg-white border border-[var(--brand-primary)]/10 shadow-md p-6 sm:p-8">
      <h1 className="text-xl sm:text-2xl font-bold text-[var(--brand-primary)] mb-2 text-center">
        Verificación de DNI / NIE
      </h1>
      <p className="text-sm sm:text-base text-[var(--foreground)] opacity-90 mb-8 text-center">
        Sube tu documento de identidad para completar tu perfil. Los archivos se almacenan de forma
        segura y se copian a tu carpeta de cliente en Diligenz.
      </p>
      <DniUploadForm />
    </div>
  );
}
