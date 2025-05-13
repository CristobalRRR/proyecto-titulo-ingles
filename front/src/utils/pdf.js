import { jsPDF } from "jspdf";

export const generarPDF = ({ curso, unidad, tema, contenidos, palabras_clave, pronunciacion, vocabulario, cancion, artista, letra }) => {
  const doc = new jsPDF();
  const margen = 15;
  let y = margen;

  const agregarTexto = (label, valor) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${label}:`, margen, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const textLines = doc.splitTextToSize(valor, 180);
    doc.text(textLines, margen + 30, y);
    y += 8 + (textLines.length - 1) * 6;
  };

  agregarTexto("Curso", curso);
  agregarTexto("Unidad (Tema)", `${unidad} (${tema})`);
  agregarTexto("Contenidos", contenidos);
  agregarTexto("Palabras clave", palabras_clave);
  agregarTexto("Pronunciación", pronunciacion);
  agregarTexto("Vocabulario", vocabulario);
  agregarTexto("Canción", `"${cancion}"`);
  agregarTexto("Autor", artista);

  // Sección Letra
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Letra:", margen, y);
  y += 8;

  const lineas = doc.splitTextToSize(letra, 180);
  for (let i = 0; i < lineas.length; i++) {
    if (y > 280) {
      doc.addPage();
      y = margen;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(lineas[i], margen, y);
    y += 6;
  }

  doc.save(`${cancion}.pdf`);
};
