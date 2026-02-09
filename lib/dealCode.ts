const PROJECT_NAMES = [
  "Atlas",
  "Orion",
  "Nexus",
  "Helios",
  "Aurora",
  "Delta",
  "Titan",
  "Vega",
];

export function generateDealTitle() {
  const name =
    PROJECT_NAMES[Math.floor(Math.random() * PROJECT_NAMES.length)];

  const suffix = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `Proyecto ${name} ${suffix}`;
}
