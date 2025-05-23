import { jsPDF } from "jspdf";

export const generarPDF = ({ 
  curso, 
  unidad, 
  tema, 
  contenidos, 
  palabras_clave, 
  pronunciacion, 
  vocabulario, 
  cancion, 
  artista, 
  letra 
}) => {
  const doc = new jsPDF();
  const margen = 15;
  let y = margen;

  // Configuración inicial
  doc.setFont("helvetica");
  doc.setFontSize(12);

  // Función mejorada para agregar texto con formato
  const agregarSeccion = (label, valor, isBoldLabel = true, isMultiLine = true) => {
    // Label en negrita
    if (isBoldLabel) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    
    doc.text(`${label}:`, margen, y);
    
    // Valor en normal
    doc.setFont("helvetica", "normal");
    
    if (isMultiLine) {
      const textWidth = doc.internal.pageSize.width - margen * 2 - 40;
      const textLines = doc.splitTextToSize(valor.toString(), textWidth);
      doc.text(textLines, margen + 40, y);
      y += textLines.length * 6; // línea más compacta
    } else {
      doc.text(valor.toString(), margen + 40, y);
      y += 7;
    }

    
    // Espacio entre secciones
    y += 5;
  };

  // Secciones principales
  agregarSeccion("Curso", curso);
  agregarSeccion("Unidad (Tema)", `${unidad} (${tema})`);
  agregarSeccion("Contenidos", contenidos);
  agregarSeccion("Palabras clave", palabras_clave);
  agregarSeccion("Pronunciación", pronunciacion);
  agregarSeccion("Vocabulario", vocabulario);
  agregarSeccion("Canción", `"${cancion}"`);
  agregarSeccion("Autor", artista);

  // Sección Letra con formato especial
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Letra (fragmento):", margen, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const limitePagina = doc.internal.pageSize.height - 30;
  const lineHeight = 6;
  const paragraphSpacing = 8;

  // Procesar la letra manteniendo los párrafos originales
  const parrafos = letra.split('\n').filter(p => p.trim() !== '');

  for (let p of parrafos) {
    const lines = doc.splitTextToSize(p.trim(), 280);
    
    // Verificar si necesitamos nueva página
    if (y + (lines.length * lineHeight) > limitePagina) {
      doc.addPage();
      y = margen;
    }
    
    // Agregar cada línea del párrafo
    for (let line of lines) {
      doc.text(line, margen, y);
      y += lineHeight;
    }
    
    // Espacio entre párrafos
    y += paragraphSpacing - lineHeight;
  }

  // Guardar el PDF
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