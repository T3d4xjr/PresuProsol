import dynamic from "next/dynamic";

const ConfigPano = dynamic(
  () => import("../../pages/panos/[tipo]"),
  { ssr: false }
);

export default function PanosForm({
  datosIniciales = null,
  onSubmit = null,
  guardando = false,
  modoEdicion = false,
}) {
  

  // Detectar tipo desde datosIniciales.tipo
  // Tipos: "paño-completo", "paño-lamas", "paño-pano"
  const tipo =
    datosIniciales?.tipo?.includes("lamas")
      ? "lamas"
      : datosIniciales?.tipo?.includes("pano")
      ? "pano"
      : "completo";

  return (
    <ConfigPano
      datosIniciales={datosIniciales}
      onSubmit={onSubmit}
      guardando={guardando}
      modoEdicion={modoEdicion}
      tipoOverride={tipo}
    />
  );
}