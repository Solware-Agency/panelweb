import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import logoImage from '../../../assets/img/logo_conspat.png'

// Add the missing types for jspdf-autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

interface ExportToPdfOptions {
  title?: string
  subtitle?: string
  filename?: string
  orientation?: 'portrait' | 'landscape'
  pageSize?: string
  includeDate?: boolean
  includeHeader?: boolean
  includeFooter?: boolean
  footerText?: string
  headerImageUrl?: string
  headerText?: string
}

// Footer text for all PDFs
const FOOTER_TEXT = `DIRECCIÓN:
VALLES DEL TUY: Edificio Multioficinas Conex / CARACAS: Policlínica Méndez Gimón – Clínica Sanatrix – Torre Centro Caracas   / MARACAY: Centro Profesional Plaza
CONTACTO: (0212) 889822 / (0414) 4861289 / (0424) 1425562
Resultados@conspat.com`;

/**
 * Export a DOM element to PDF
 */
export const exportElementToPdf = async (
  element: HTMLElement,
  options: ExportToPdfOptions = {}
) => {
  const {
    title = 'Reporte',
    subtitle = '',
    filename = `reporte-${format(new Date(), 'yyyy-MM-dd-HHmm')}`,
    orientation = 'portrait',
    pageSize = 'a4',
    includeDate = true,
    includeHeader = true,
    includeFooter = true,
    footerText = FOOTER_TEXT,
    headerText = 'Sistema de Registros Médicos',
  } = options

  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    })

    // Set document properties
    pdf.setProperties({
      title: title,
      subject: subtitle,
      author: 'Sistema de Registros Médicos',
      creator: 'Sistema de Registros Médicos',
    })

    // Add header
    if (includeHeader) {
      // Add logo
      try {
        pdf.addImage(logoImage, 'PNG', 14, 10, 30, 15)
      } catch (error) {
        console.error('Error adding logo to PDF:', error)
      }
      
      pdf.setFontSize(18)
      pdf.setTextColor(33, 33, 33)
      pdf.text(headerText, 50, 20)

      // Add title
      pdf.setFontSize(16)
      pdf.setTextColor(33, 33, 33)
      pdf.text(title, 14, 30)

      // Add subtitle if provided
      if (subtitle) {
        pdf.setFontSize(12)
        pdf.setTextColor(100, 100, 100)
        pdf.text(subtitle, 14, 38)
      }

      // Add date if requested
      if (includeDate) {
        const dateStr = format(new Date(), 'PPP', { locale: es })
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Fecha: ${dateStr}`, pdf.internal.pageSize.getWidth() - 60, 20)
      }

      // Add a separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(14, 42, pdf.internal.pageSize.getWidth() - 14, 42)
    }

    // Capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Enable CORS for external images
      logging: false, // Disable logging
      allowTaint: true, // Allow tainted canvas
      backgroundColor: '#ffffff', // White background
    })

    // Calculate dimensions to fit the page
    const imgData = canvas.toDataURL('image/png')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    
    // Calculate margins
    const marginTop = includeHeader ? 50 : 10
    const marginBottom = includeFooter ? 30 : 10 // Increased margin for footer
    const availableHeight = pageHeight - marginTop - marginBottom
    
    // Calculate image dimensions to fit the page
    const imgWidth = pageWidth - 28 // 14mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    // If the image is too tall, scale it down
    let finalImgHeight = imgHeight
    let finalImgWidth = imgWidth
    
    if (imgHeight > availableHeight) {
      finalImgHeight = availableHeight
      finalImgWidth = (canvas.width * finalImgHeight) / canvas.height
    }
    
    // Center the image horizontally
    const imgX = (pageWidth - finalImgWidth) / 2
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', imgX, marginTop, finalImgWidth, finalImgHeight)

    // Add footer
    if (includeFooter) {
      const totalPages = pdf.getNumberOfPages()
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        
        // Set font for footer
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        
        // Split footer text into lines
        const footerLines = footerText.split('\n')
        const lineHeight = 3.5
        const startY = pageHeight - (footerLines.length * lineHeight) - 5
        
        // Add each line of the footer
        footerLines.forEach((line, index) => {
          pdf.text(line, 14, startY + (index * lineHeight))
        })
        
        // Add page number
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10)
      }
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`)
    
    return true
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return false
  }
}

/**
 * Export tabular data to PDF
 */
export const exportTableToPdf = (
  headers: string[],
  data: any[],
  options: ExportToPdfOptions = {}
) => {
  const {
    title = 'Reporte',
    subtitle = '',
    filename = `reporte-${format(new Date(), 'yyyy-MM-dd-HHmm')}`,
    orientation = 'portrait',
    pageSize = 'a4',
    includeDate = true,
    includeHeader = true,
    includeFooter = true,
    footerText = FOOTER_TEXT,
    headerText = 'Sistema de Registros Médicos',
  } = options

  try {
    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    })

    // Set document properties
    pdf.setProperties({
      title: title,
      subject: subtitle,
      author: 'Sistema de Registros Médicos',
      creator: 'Sistema de Registros Médicos',
    })

    // Add header
    if (includeHeader) {
      // Add logo
      try {
        pdf.addImage(logoImage, 'PNG', 14, 10, 30, 15)
      } catch (error) {
        console.error('Error adding logo to PDF:', error)
      }
      
      pdf.setFontSize(18)
      pdf.setTextColor(33, 33, 33)
      pdf.text(headerText, 50, 20)

      // Add title
      pdf.setFontSize(16)
      pdf.setTextColor(33, 33, 33)
      pdf.text(title, 14, 30)

      // Add subtitle if provided
      if (subtitle) {
        pdf.setFontSize(12)
        pdf.setTextColor(100, 100, 100)
        pdf.text(subtitle, 14, 38)
      }

      // Add date if requested
      if (includeDate) {
        const dateStr = format(new Date(), 'PPP', { locale: es })
        pdf.setFontSize(10)
        pdf.setTextColor(100, 100, 100)
        pdf.text(`Fecha: ${dateStr}`, pdf.internal.pageSize.getWidth() - 60, 20)
      }

      // Add a separator line
      pdf.setDrawColor(200, 200, 200)
      pdf.line(14, 42, pdf.internal.pageSize.getWidth() - 14, 42)
    }

    // Add table
    pdf.autoTable({
      head: [headers],
      body: data,
      startY: includeHeader ? 50 : 10,
      margin: { top: 10, right: 14, bottom: includeFooter ? 35 : 10, left: 14 }, // Increased bottom margin for footer
      headStyles: {
        fillColor: [128, 0, 128], // Purple color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
    })

    // Add footer
    if (includeFooter) {
      const totalPages = pdf.getNumberOfPages()
      
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        
        // Set font for footer
        pdf.setFontSize(8)
        pdf.setTextColor(100, 100, 100)
        
        // Split footer text into lines
        const footerLines = footerText.split('\n')
        const lineHeight = 3.5
        const startY = pdf.internal.pageSize.getHeight() - (footerLines.length * lineHeight) - 5
        
        // Add each line of the footer
        footerLines.forEach((line, index) => {
          pdf.text(line, 14, startY + (index * lineHeight))
        })
        
        // Add page number
        pdf.text(`Página ${i} de ${totalPages}`, pdf.internal.pageSize.getWidth() - 30, pdf.internal.pageSize.getHeight() - 10)
      }
    }

    // Save the PDF
    pdf.save(`${filename}.pdf`)
    
    return true
  } catch (error) {
    console.error('Error exporting to PDF:', error)
    return false
  }
}