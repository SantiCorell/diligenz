/** Comunidades autónomas y ciudades autónomas de España (valores guardados en Company.location). */
export const SPAIN_CCAA_OPTIONS = [
  { value: "", label: "Selecciona una comunidad autónoma" },
  { value: "andalucia", label: "Andalucía" },
  { value: "aragon", label: "Aragón" },
  { value: "asturias", label: "Principado de Asturias" },
  { value: "baleares", label: "Islas Baleares" },
  { value: "canarias", label: "Canarias" },
  { value: "cantabria", label: "Cantabria" },
  { value: "castilla-la-mancha", label: "Castilla-La Mancha" },
  { value: "castilla-y-leon", label: "Castilla y León" },
  { value: "cataluna", label: "Cataluña" },
  { value: "comunidad-valenciana", label: "Comunidad Valenciana" },
  { value: "extremadura", label: "Extremadura" },
  { value: "galicia", label: "Galicia" },
  { value: "madrid", label: "Comunidad de Madrid" },
  { value: "murcia", label: "Región de Murcia" },
  { value: "navarra", label: "Comunidad Foral de Navarra" },
  { value: "pais-vasco", label: "País Vasco" },
  { value: "la-rioja", label: "La Rioja" },
  { value: "ceuta", label: "Ceuta" },
  { value: "melilla", label: "Melilla" },
] as const;

export function ccaaLabel(value: string): string {
  const found = SPAIN_CCAA_OPTIONS.find((o) => o.value === value);
  if (found) return found.label;
  return value.trim() || "—";
}
