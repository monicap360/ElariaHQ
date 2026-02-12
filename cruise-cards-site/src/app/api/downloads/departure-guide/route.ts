import { NextRequest, NextResponse } from "next/server";

type Language = "en" | "es";

const GUIDE_CONTENT: Record<Language, { title: string; subtitle: string; lines: string[] }> = {
  en: {
    title: "Cruises From Galveston",
    subtitle: "Cruise Departure Guide",
    lines: [
      "This guide is designed for calm, practical departure planning.",
      "",
      "60 Days Out",
      "- Confirm passports/IDs and legal travel names",
      "- Select terminal parking or park-and-ride",
      "- Review SeaPay deposit and payment schedule",
      "",
      "30 Days Out",
      "- Complete online check-in and emergency contacts",
      "- Finalize cabin category and travel protection",
      "- Reserve hotel night if driving 5+ hours",
      "",
      "14 Days Out",
      "- Verify terminal assignment and boarding window",
      "- Confirm shuttle/transfer and parking entry details",
      "- Download digital docs and backup printed copies",
      "",
      "7 Days Out",
      "- Monitor sailings and weather adjustments",
      "- Set luggage tags and carry-on essentials",
      "- Share itinerary with family contacts",
      "",
      "Departure Day",
      "- Arrive with buffer time and photo ID ready",
      "- Keep medication and documents in carry-on",
      "- Follow terminal staff flow for a smooth check-in",
      "",
      "Need help? cruisesfromgalveston.net/booking",
    ],
  },
  es: {
    title: "Cruises From Galveston",
    subtitle: "Guia de Salida de Crucero",
    lines: [
      "Esta guia esta creada para planificar tu salida con calma y claridad.",
      "",
      "60 Dias Antes",
      "- Confirma pasaportes/identificaciones y nombres legales",
      "- Elige estacionamiento del terminal o park-and-ride",
      "- Revisa deposito SeaPay y calendario de pagos",
      "",
      "30 Dias Antes",
      "- Completa check-in en linea y contactos de emergencia",
      "- Finaliza categoria de cabina y proteccion de viaje",
      "- Reserva hotel si manejas mas de 5 horas",
      "",
      "14 Dias Antes",
      "- Verifica terminal asignada y horario de abordaje",
      "- Confirma traslado y detalles de estacionamiento",
      "- Descarga documentos digitales y copias impresas",
      "",
      "7 Dias Antes",
      "- Revisa cambios de salida y clima",
      "- Prepara etiquetas de equipaje y articulos de mano",
      "- Comparte itinerario con familiares",
      "",
      "Dia de Salida",
      "- Llega con tiempo extra e identificacion lista",
      "- Lleva medicinas y documentos en equipaje de mano",
      "- Sigue al personal del terminal para check-in fluido",
      "",
      "Necesitas ayuda? cruisesfromgalveston.net/booking",
    ],
  },
};

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const printableLines = lines.slice(0, 48);
  const textOps = [
    "BT",
    "/F1 12 Tf",
    "14 TL",
    "72 760 Td",
    ...printableLines.flatMap((line, index) => {
      const escaped = escapePdfText(line);
      if (index === 0) return [`(${escaped}) Tj`];
      return ["T*", `(${escaped}) Tj`];
    }),
    "ET",
  ];
  const stream = textOps.join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
    `5 0 obj\n<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream\nendobj\n`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += object;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

export async function GET(request: NextRequest) {
  const langParam = request.nextUrl.searchParams.get("lang");
  const lang: Language = langParam === "es" ? "es" : "en";
  const content = GUIDE_CONTENT[lang];
  const lines = [content.title, content.subtitle, "", ...content.lines];
  const pdf = buildSimplePdf(lines);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cruise-departure-guide-${lang}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
