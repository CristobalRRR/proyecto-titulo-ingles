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
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SongIAdvice: Aprendiendo inglés con canciones", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 15;

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
  doc.save(`${cancion}-Informativo.pdf`);
};

export const generarPDFContenidos = ({ 
  curso, 
  unidad, 
  tema, 
  contenidos, 
  palabras_clave, 
  pronunciacion, 
  vocabulario, 
  cancion, 
  artista, 
  letra, 
}) => {
  const doc = new jsPDF();
  const margen = 15;
  let y = margen;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("SongIAdvice: Aprendiendo inglés con canciones", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 15;

  const textWidth = doc.internal.pageSize.width - margen * 2;

  const agregarSeccion = (label, valor, isBoldLabel = true, isMultiLine = true) => {
    if (isBoldLabel) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
  
    doc.text(`${label}:`, margen, y);
    doc.setFont("helvetica", "normal");
    
    if (isMultiLine) {
      const textLines = doc.splitTextToSize(valor.toString(), textWidth - 40); // limit width for values
      doc.text(textLines, margen + 40, y);
      y += textLines.length * 6;
    } else {
      doc.text(valor.toString(), margen + 40, y);
      y += 7;
    }
  
    y += 5;
  };

  agregarSeccion("Curso", curso);
  agregarSeccion("Unidad (Tema)", `${unidad} (${tema})`);
  agregarSeccion("Contenidos", contenidos);
  agregarSeccion("Palabras clave", palabras_clave);
  agregarSeccion("Pronunciación", pronunciacion);
  agregarSeccion("Vocabulario", vocabulario);
  agregarSeccion("Canción", `"${cancion}"`);
  agregarSeccion("Autor", artista);

  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Letra aplicando contenidos:", margen, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const limitePagina = doc.internal.pageSize.height - 30;
  const lineHeight = 6;
  const paragraphSpacing = 8;

  
  const parrafos = letra.split('\n').filter(p => p.trim() !== '');
  for (let p of parrafos) {
    const lines = doc.splitTextToSize(p.trim(), textWidth);
    if (y + (lines.length * lineHeight) > limitePagina) {
      doc.addPage();
      y = margen;
    }

    //Aqui es donde se aplica la negrita en las palabras claves
    lines.forEach(line => {
      let x = margen;
      const parts = line.split(/(\*\*[^\*]+\*\*)/); // divide por texto en **negrita**
      parts.forEach(part => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2); // remueve los **
          doc.setFont("helvetica", "bold");
          doc.text(boldText, x, y, { baseline: 'top' });
          const textWidth = doc.getTextWidth(boldText);
          x += textWidth;
        } else {
          doc.setFont("helvetica", "normal");
          doc.text(part, x, y, { baseline: 'top' });
          const textWidth = doc.getTextWidth(part);
          x += textWidth;
        }
      });   
      y += lineHeight;
    });
    
    y += paragraphSpacing - lineHeight;
  }
  doc.save(`${cancion}-Contenidos.pdf`);
};

export const generarPDFAlumno = ({ 
  curso, 
  unidad, 
  tema, 
  contenidos, 
  palabras_clave, 
  pronunciacion, 
  vocabulario, 
  cancion, 
  artista, 
  letra, 
}) => {
  const doc = new jsPDF();
  const margen = 15;
  let y = margen;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("SongIAdvice: Aprendiendo inglés con canciones", doc.internal.pageSize.getWidth() / 2, y, { align: "center" });
  y += 15;
  const textWidth = doc.internal.pageSize.width - margen * 2;
  const agregarSeccion = (label, valor, isBoldLabel = true, isMultiLine = true) => {
    if (isBoldLabel) {
      doc.setFont("helvetica", "bold");
    } else {
      doc.setFont("helvetica", "normal");
    }
    doc.text(`${label}:`, margen, y);
    doc.setFont("helvetica", "normal");
    if (isMultiLine) {
      const textLines = doc.splitTextToSize(valor.toString(), textWidth - 40); // limit width for values
      doc.text(textLines, margen + 40, y);
      y += textLines.length * 6;
    } else {
      doc.text(valor.toString(), margen + 40, y);
      y += 7;
    }
    y += 5;
  };
  agregarSeccion("Curso", curso);
  agregarSeccion("Unidad (Tema)", `${unidad} (${tema})`);
  agregarSeccion("Contenidos", contenidos);
  agregarSeccion("Palabras clave", palabras_clave);
  agregarSeccion("Pronunciación", pronunciacion);
  agregarSeccion("Vocabulario", vocabulario);
  agregarSeccion("Canción", `"${cancion}"`);
  agregarSeccion("Autor", artista);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Letra, verbos y contenido:", margen, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const limitePagina = doc.internal.pageSize.height - 30;
  const lineHeight = 6;
  const paragraphSpacing = 8;
  const parrafos = letra.split('\n').filter(p => p.trim() !== '');
  for (let p of parrafos) {
    const lines = doc.splitTextToSize(p.trim(), textWidth);
    if (y + (lines.length * lineHeight) > limitePagina) {
      doc.addPage();
      y = margen;
    }
    lines.forEach(line => {
      let x = margen;
      const parts = line.split(/(\*\*[^\*]+\*\*)/); // divide por texto en **negrita**
      parts.forEach(part => {
        if (part.startsWith("**") && part.endsWith("**")) {
          const boldText = part.slice(2, -2); // remueve los **
          doc.setFont("helvetica", "bold");
          doc.text(boldText, x, y, { baseline: 'top' });
          const textWidth = doc.getTextWidth(boldText);
          x += textWidth;
        } else {
          doc.setFont("helvetica", "normal");
          doc.text(part, x, y, { baseline: 'top' });
          const textWidth = doc.getTextWidth(part);
          x += textWidth;
        }
      });   
      y += lineHeight;
    });
    
    y += paragraphSpacing - lineHeight;
  }
  doc.save(`${cancion}-Alumno.pdf`);
};
