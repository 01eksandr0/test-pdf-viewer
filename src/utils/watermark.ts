import { PDFDocument, rgb, StandardFonts, Degrees } from 'pdf-lib'

export interface WatermarkOptions {
  text?: string
  fontSize?: number
  color?: { r: number; g: number; b: number }
  opacity?: number
  rotation?: number
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  x?: number
  y?: number
}

export interface ImageWatermarkOptions {
  imageUrl: string
  opacity?: number
  rotation?: number
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  x?: number
  y?: number
  width?: number
  height?: number
}


export async function addTextWatermark(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: WatermarkOptions = {}
): Promise<Uint8Array> {
  const {
    text = 'CONFIDENTIAL',
    fontSize = 48,
    color = { r: 1, g: 0, b: 0 }, 
    opacity = 0.3,
    rotation = -45,
    position = 'center',
    x,
    y
  } = options

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  for (const page of pages) {
    const { width, height } = page.getSize()
    
    let watermarkX: number
    let watermarkY: number
    
    if (x !== undefined && y !== undefined) {
      watermarkX = x
      watermarkY = y
    } else {
      const textWidth = font.widthOfTextAtSize(text, fontSize)
      const textHeight = fontSize
      
      switch (position) {
        case 'center':
          watermarkX = (width - textWidth) / 2
          watermarkY = (height - textHeight) / 2
          break
        case 'top-left':
          watermarkX = 50
          watermarkY = height - 50
          break
        case 'top-right':
          watermarkX = width - textWidth - 50
          watermarkY = height - 50
          break
        case 'bottom-left':
          watermarkX = 50
          watermarkY = 50
          break
        case 'bottom-right':
          watermarkX = width - textWidth - 50
          watermarkY = 50
          break
        default:
          watermarkX = (width - textWidth) / 2
          watermarkY = (height - textHeight) / 2
      }
    }

    page.drawText(text, {
      x: watermarkX,
      y: watermarkY,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: { type: 'degrees', angle: rotation } as Degrees
    })
  }

  return await pdfDoc.save()
}

/**
 */
export async function addImageWatermark(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: ImageWatermarkOptions
): Promise<Uint8Array> {
  const {
    imageUrl,
    opacity = 0.3,
    rotation = 0,
    position = 'center',
    x,
    y,
    width: imageWidth,
    height: imageHeight
  } = options

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()

  let image
  try {
    const response = await fetch(imageUrl)
    const imageBytes = await response.arrayBuffer()
    
    if (imageUrl.toLowerCase().includes('.png')) {
      image = await pdfDoc.embedPng(imageBytes)
    } else if (imageUrl.toLowerCase().includes('.jpg') || imageUrl.toLowerCase().includes('.jpeg')) {
      image = await pdfDoc.embedJpg(imageBytes)
    } else {
      throw new Error('Неподдерживаемый формат изображения. Используйте PNG или JPG.')
    }
  } catch (error) {
    throw new Error(`Ошибка загрузки изображения: ${error}`)
  }

  for (const page of pages) {
    const { width, height } = page.getSize()
    
    const finalWidth = imageWidth || Math.min(width * 0.3, image.width)
    const finalHeight = imageHeight || (image.height * finalWidth) / image.width
    
    let watermarkX: number
    let watermarkY: number
    
    if (x !== undefined && y !== undefined) {
      watermarkX = x
      watermarkY = y
    } else {
      switch (position) {
        case 'center':
          watermarkX = (width - finalWidth) / 2
          watermarkY = (height - finalHeight) / 2
          break
        case 'top-left':
          watermarkX = 50
          watermarkY = height - finalHeight - 50
          break
        case 'top-right':
          watermarkX = width - finalWidth - 50
          watermarkY = height - finalHeight - 50
          break
        case 'bottom-left':
          watermarkX = 50
          watermarkY = 50
          break
        case 'bottom-right':
          watermarkX = width - finalWidth - 50
          watermarkY = 50
          break
        default:
          watermarkX = (width - finalWidth) / 2
          watermarkY = (height - finalHeight) / 2
      }
    }

    page.drawImage(image, {
      x: watermarkX,
      y: watermarkY,
      width: finalWidth,
      height: finalHeight,
      opacity,
      rotate: { type: 'degrees', angle: rotation } as Degrees
    })
  }

  return await pdfDoc.save()
}

/**
 */
export async function addMultipleTextWatermarks(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: WatermarkOptions & { spacing?: number } = {}
): Promise<Uint8Array> {
  const {
    text = 'CONFIDENTIAL',
    fontSize = 24,
    color = { r: 1, g: 0, b: 0 },
    opacity = 0.1,
    rotation = -45,
    spacing = 200
  } = options

  const pdfDoc = await PDFDocument.load(pdfBytes)
  const pages = pdfDoc.getPages()
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  for (const page of pages) {
    const { width, height } = page.getSize()
    
    for (let x = 0; x < width + spacing; x += spacing) {
      for (let y = 0; y < height + spacing; y += spacing) {
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(color.r, color.g, color.b),
          opacity,
          rotate: { type: 'degrees', angle: rotation } as Degrees
        })
      }
    }
  }

  return await pdfDoc.save()
}
