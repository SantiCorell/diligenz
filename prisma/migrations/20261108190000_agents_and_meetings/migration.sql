-- CreateEnum
CREATE TYPE "AgentMeetingStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "photoMime" TEXT,
    "photoData" BYTEA,
    "bookingUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentMeeting" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "externalEventUri" TEXT,
    "status" "AgentMeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentMeeting_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN "assignedAgentId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AgentMeeting_externalEventUri_key" ON "AgentMeeting"("externalEventUri");

-- CreateIndex
CREATE INDEX "AgentMeeting_userId_startsAt_idx" ON "AgentMeeting"("userId", "startsAt");

-- CreateIndex
CREATE INDEX "User_assignedAgentId_idx" ON "User"("assignedAgentId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_assignedAgentId_fkey" FOREIGN KEY ("assignedAgentId") REFERENCES "Agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMeeting" ADD CONSTRAINT "AgentMeeting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentMeeting" ADD CONSTRAINT "AgentMeeting_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Agente inicial: Jose Cañizares
INSERT INTO "Agent" (
    "id",
    "name",
    "email",
    "phone",
    "photoUrl",
    "bookingUrl",
    "active",
    "isDefault",
    "createdAt",
    "updatedAt"
) VALUES (
    'agent_jose_canizares',
    'Jose Cañizares',
    'jose@diligenz.es',
    '623 941 511',
    '/agents/jose-canizares.jpg',
    'https://calendly.com/jose-diligenz/30min',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

UPDATE "User"
SET "assignedAgentId" = 'agent_jose_canizares'
WHERE "assignedAgentId" IS NULL
  AND "deletedAt" IS NULL;
