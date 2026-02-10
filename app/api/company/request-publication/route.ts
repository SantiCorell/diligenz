import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2️⃣ Body
    const body = await req.formData();
    const companyId = body.get("companyId") as string | null;

    if (!companyId) {
      return NextResponse.json(
        { error: "Missing companyId" },
        { status: 400 }
      );
    }

    // 3️⃣ Cargar empresa con documentos
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: {
        documents: true,
        deals: true,
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Ownership
    if (company.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // 5️⃣ Estado válido
    if (company.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Company is not in draft state" },
        { status: 400 }
      );
    }

    // 6️⃣ Validación legal: todos los documentos firmados
    const allDocsSigned =
      company.documents.length > 0 &&
      company.documents.every((doc) => doc.signed);

    if (!allDocsSigned) {
      return NextResponse.json(
        { error: "All documents must be signed" },
        { status: 400 }
      );
    }

    // 7️⃣ Pasar a revisión
    await prisma.company.update({
      where: { id: companyId },
      data: {
        status: "IN_PROCESS",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Publication request submitted. Our team will review your project.",
    });
  } catch (error) {
    console.error("Request publication error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
