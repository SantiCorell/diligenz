-- Datos exportados desde SQLite local para importar en Supabase (PostgreSQL)
-- Ejecutar DESPUÉS de haber creado las tablas (supabase-init.sql o prisma db push)
-- Generado con: node scripts/export-local-to-supabase.mjs

-- User
INSERT INTO "User" (id, email, "passwordHash", phone, role, "emailVerified", "ndaSigned", "dniVerified", blocked, "blockedUntil", "createdAt", "updatedAt") VALUES ('cmkquhlkq00002jjfowg526l3', 'santiago.corellvidal@gmail.com', '$2b$10$SSPYzkMziG6R7E4RoFQEWuJFLoxmhGdItXGwngbNi.KYtSEOlc.J.', '669918542', 'ADMIN', false, false, false, false, NULL, '2026-01-23 12:16:27', '2026-01-23 12:16:27') ON CONFLICT (id) DO NOTHING;
INSERT INTO "User" (id, email, "passwordHash", phone, role, "emailVerified", "ndaSigned", "dniVerified", blocked, "blockedUntil", "createdAt", "updatedAt") VALUES ('cmle1j63o00064tm60lmpyly5', 'joselitocanizares@hotmail.com', '$2b$10$LJ292HLm1OhZv6PcNrMKUe.bkJ6SEflyhvtuscTepPth70U8HJHQy', '679620672', 'ADMIN', false, false, false, false, NULL, '2026-02-08 17:52:19', '2026-02-08 17:52:19') ON CONFLICT (id) DO NOTHING;

-- Company
INSERT INTO "Company" (id, name, sector, location, revenue, ebitda, employees, description, status, "createdAt", "ownerId") VALUES ('cmkqutwbk00012jg1ala3rbue', 'Empresa sin nombre', 'Tecnologia', 'Valencia', '100000', '50000', 20, NULL, 'PUBLISHED', '2026-01-23 12:26:00', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Company" (id, name, sector, location, revenue, ebitda, employees, description, status, "createdAt", "ownerId") VALUES ('cmku12mvm00014tuqmo8pjulp', 'Empresa sin nombre', 'Farmaceutico', 'Barcellona', '20000000', '2000000', 4, NULL, 'DRAFT', '2026-01-25 17:44:04', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Company" (id, name, sector, location, revenue, ebitda, employees, description, status, "createdAt", "ownerId") VALUES ('cmkvfb5oj00012jstotkhsle6', 'Empresa sin nombre', 'tecnologia', 'Valencia', '1000000', '10000', 2, NULL, 'PUBLISHED', '2026-01-26 17:10:23', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Company" (id, name, sector, location, revenue, ebitda, employees, description, status, "createdAt", "ownerId") VALUES ('cmkvfxm9v00072jstkqbxit1m', 'Empresa sin nombre', 'industria', 'Valencia', '500000', '10000', 1, NULL, 'DRAFT', '2026-01-26 17:27:51', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Company" (id, name, sector, location, revenue, ebitda, employees, description, status, "createdAt", "ownerId") VALUES ('cmle1cqnn00014tm6y2n61bhz', 'Empresa sin nombre', 'industria', 'Madrid', '1000000', '10000', 3, NULL, 'PUBLISHED', '2026-02-08 17:47:19', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;

-- Deal
INSERT INTO "Deal" (id, title, slug, published, "createdAt", "companyId") VALUES ('cmkqutwbq00052jg1ts7v86wv', 'Empresa en Tecnologia (Valencia)', 'tecnologia-valencia-cmkqutwbk00012jg1ala3rbue', true, '2026-01-23 12:26:00', 'cmkqutwbk00012jg1ala3rbue') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Deal" (id, title, slug, published, "createdAt", "companyId") VALUES ('cmku12mvt00054tuqtdddxcmd', 'Proyecto Aurora ZOL9', 'farmaceutico-barcellona-cmku12mvm00014tuqmo8pjulp', false, '2026-01-25 17:44:04', 'cmku12mvm00014tuqmo8pjulp') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Deal" (id, title, slug, published, "createdAt", "companyId") VALUES ('cmkvfb5ou00052jstbnnefglx', 'Proyecto Nexus 7BGQ', 'tecnologia-valencia-cmkvfb5oj00012jstotkhsle6', true, '2026-01-26 17:10:23', 'cmkvfb5oj00012jstotkhsle6') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Deal" (id, title, slug, published, "createdAt", "companyId") VALUES ('cmkvfxm9w000b2jst18z296te', 'Proyecto Titan 9J0H', 'industria-valencia-cmkvfxm9v00072jstkqbxit1m', false, '2026-01-26 17:27:51', 'cmkvfxm9v00072jstkqbxit1m') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Deal" (id, title, slug, published, "createdAt", "companyId") VALUES ('cmle1cqnp00054tm6dlkmlfh1', 'Proyecto Vega B7EB', 'industria-madrid-cmle1cqnn00014tm6y2n61bhz', true, '2026-02-08 17:47:19', 'cmle1cqnn00014tm6y2n61bhz') ON CONFLICT (id) DO NOTHING;

-- Valuation
INSERT INTO "Valuation" (id, "minValue", "maxValue", "createdAt", "companyId") VALUES ('cmkqutwbp00032jg1u44q9yeu', 120000, 240000, '2026-01-23 12:26:00', 'cmkqutwbk00012jg1ala3rbue') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Valuation" (id, "minValue", "maxValue", "createdAt", "companyId") VALUES ('cmku12mvs00034tuqbyucq1rt', 4800000, 9600000, '2026-01-25 17:44:04', 'cmku12mvm00014tuqmo8pjulp') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Valuation" (id, "minValue", "maxValue", "createdAt", "companyId") VALUES ('cmkvfb5os00032jst92u11t61', 24000, 48000, '2026-01-26 17:10:23', 'cmkvfb5oj00012jstotkhsle6') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Valuation" (id, "minValue", "maxValue", "createdAt", "companyId") VALUES ('cmkvfxm9w00092jst44nupc0n', 24000, 48000, '2026-01-26 17:27:51', 'cmkvfxm9v00072jstkqbxit1m') ON CONFLICT (id) DO NOTHING;
INSERT INTO "Valuation" (id, "minValue", "maxValue", "createdAt", "companyId") VALUES ('cmle1cqno00034tm6rhchqwx1', 24000, 48000, '2026-02-08 17:47:19', 'cmle1cqnn00014tm6y2n61bhz') ON CONFLICT (id) DO NOTHING;

-- UserCompanyInterest
INSERT INTO "UserCompanyInterest" (id, "companyId", type, status, "createdAt", "userId") VALUES ('cmle4cd2k00084tm6b9g6kyws', 'mock-3', 'REQUEST_INFO', 'MANAGED', '2026-02-08 19:11:00', 'cmkquhlkq00002jjfowg526l3') ON CONFLICT (id) DO NOTHING;
