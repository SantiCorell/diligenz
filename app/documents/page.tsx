import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getUserIdFromSession } from "@/lib/session";

export default async function DocumentsPage() {
  const userId = await getUserIdFromSession();
  if (!userId) redirect("/login");

  const companies = await prisma.company.findMany({
    where: { ownerId: userId },
    include: {
      deals: true,
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          Documentación
        </h1>
        <p className="mt-2 text-gray-600">
          La publicación de un proyecto requiere la firma previa de la documentación.
        </p>

        <div className="mt-8 space-y-6">
          {companies.map((company) => {
            const deal = company.deals[0];

            return (
              <div
                key={company.id}
                className="rounded-2xl bg-white p-6 shadow"
              >
                <h2 className="text-xl font-semibold">
                  {deal?.title || "Proyecto"}
                </h2>

                <div className="mt-4 space-y-3">
                  {company.documents.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Documentación pendiente de asignar.
                    </p>
                  )}

                  {company.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between rounded-lg border px-4 py-3"
                    >
                      <span className="text-sm font-medium">
                        {doc.type === "SALES_MANDATE" && "Mandato de venta"}
                        {doc.type === "NDA" && "Acuerdo de confidencialidad"}
                        {doc.type === "AUTHORIZATION" && "Autorización de valoración"}
                      </span>

                      <span
                        className={`text-sm font-medium ${
                          doc.signed
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {doc.signed ? "Firmado" : "Pendiente"}
                      </span>
                    </div>
                  ))}
                </div>

                {!deal?.published && (
                  <p className="mt-4 text-sm text-gray-500">
                    🔒 Este proyecto no se publicará hasta que toda la documentación esté firmada.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
