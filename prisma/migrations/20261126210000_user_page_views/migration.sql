-- Vistas de usuarios con sesión (ruta, momento y duración). No se envían a Google.
CREATE TABLE "UserPageView" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserPageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserPageView_userId_startedAt_idx" ON "UserPageView"("userId", "startedAt");

CREATE INDEX "UserPageView_startedAt_idx" ON "UserPageView"("startedAt");

CREATE INDEX "UserPageView_path_startedAt_idx" ON "UserPageView"("path", "startedAt");

ALTER TABLE "UserPageView" ADD CONSTRAINT "UserPageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
