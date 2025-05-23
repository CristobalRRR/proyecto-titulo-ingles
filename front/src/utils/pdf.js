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

const limitePagina = doc.internal.pageSize.height - 20;
const parrafos = letra.split(/\n\s*\n/);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);

for (let p of parrafos) {
  const lines = doc.splitTextToSize(p.trim(), 180);
  for (let line of lines) {
    if (y > limitePagina) {
      doc.addPage();
      y = margen;
    }
    doc.text(line, margen, y);
    y += 6;
  }
  y += 4;
}


  doc.save(`${cancion}.pdf`);
};

/*export const generarPDFContenidos = ({ curso, unidad, tema, contenidos, palabras_clave, pronunciacion, vocabulario, cancion, artista, letra }) => {
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

const limitePagina = doc.internal.pageSize.height - 20;
const parrafos = letra.split(/\n\s*\n/);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);

for (let p of parrafos) {
  const lines = doc.splitTextToSize(p.trim(), 180);
  for (let line of lines) {
    if (y > limitePagina) {
      doc.addPage();
      y = margen;
    }
    doc.text(line, margen, y);
    y += 6;
  }
  y += 4;
}


  doc.save(`${cancion}.pdf`);
};
*/