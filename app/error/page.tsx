import ErrorFallbackContent from "@/components/ErrorFallbackContent";

export const metadata = {
  title: "Ha ocurrido un error",
  description: "Algo no ha ido como esperábamos. Sigue las instrucciones o contacta con nosotros.",
  robots: { index: false, follow: false },
};

export default function ErrorPage() {
  return <ErrorFallbackContent showRetry={false} />;
}
