import { jsPDF } from "jspdf";

export const generarPDF = ({ curso, unidad, tema, contenidos, palabras_clave, pronunciacion, vocabulario, cancion, artista, letra }) => {
  const doc = new jsPDF();

  const margen = 10;
  let y = margen;

  const agregarTexto = (label, valor) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, margen, y);
    doc.setFont("helvetica", "normal");
    doc.text(valor, margen + 30, y);
    y += 8;
  };

  agregarTexto("Curso", curso);
  agregarTexto("Unidad (Tema)", `${unidad} (${tema})`);
  agregarTexto("Contenidos", contenidos);
  agregarTexto("Palabras clave", palabras_clave);
  agregarTexto("Pronunciación", pronunciacion);
  agregarTexto("Vocabulario", vocabulario);
  agregarTexto("Canción", cancion);
  agregarTexto("Autor", artista);

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Letra:", margen, y);
  y += 8;

  const lineas = doc.splitTextToSize(letra, 180);
  for (let i = 0; i < lineas.length; i++) {
    if (y > 280) {
      doc.addPage();
      y = margen;
    }
    doc.setFont("helvetica", "normal");
    doc.text(lineas[i], margen, y);
    y += 6;
  }

  doc.save(`${cancion}.pdf`);
};
