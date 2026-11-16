-- Totales agregados de páginas. Sin identificador de visitante.
CREATE TABLE "AggregatePageMetric" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "nav" TEXT NOT NULL,
    "perf" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AggregatePageMetric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AggregatePageMetric_path_day_nav_perf_key" ON "AggregatePageMetric"("path", "day", "nav", "perf");

CREATE INDEX "AggregatePageMetric_day_idx" ON "AggregatePageMetric"("day");
