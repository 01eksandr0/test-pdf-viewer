// Client-side decryption utilities
export interface EncryptedData {
  success: boolean;
  encryptedData: string;
  iv: string;
  algorithm: string;
  originalSize: number;
  error?: string;
}

export interface DecryptKey {
  key: string;
  algorithm: string;
}

/**
 * Decrypts base64 encoded encrypted data using AES-256-CBC
 */
export async function decryptBuffer(
  encryptedData: string,
  key: string,
  iv: string,
  algorithm: string = 'AES-CBC'
): Promise<ArrayBuffer> {
  try {
    console.log('Starting decryption...');
    console.log('Encrypted data length:', encryptedData.length);
    console.log('IV string:', iv);
    console.log('Key length:', key.length);
    
    // Convert base64 strings to ArrayBuffer
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    const keyBuffer = base64ToArrayBuffer(key);
    
    // Parse IV with proper validation
    const ivBuffer = parseIV(iv);
    
    console.log('Encrypted buffer size:', encryptedBuffer.byteLength);
    console.log('Key buffer size:', keyBuffer.byteLength);
    console.log('IV buffer size:', ivBuffer.byteLength);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: algorithm },
      false,
      ['decrypt']
    );

    console.log('Key imported successfully');

    // Decrypt the data
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: algorithm,
        iv: ivBuffer,
      },
      cryptoKey,
      encryptedBuffer
    );

    console.log('Decryption completed, result size:', decryptedBuffer.byteLength);
    return decryptedBuffer;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error(`Failed to decrypt data: ${error}`);
  }
}

/**
 * Converts base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Converts hex string to ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  // Remove any whitespace and ensure even length
  const cleanHex = hex.replace(/\s/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string: odd length');
  }
  
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Validates and converts IV string to ArrayBuffer
 * Supports both base64 and hex formats
 */
function parseIV(ivString: string): ArrayBuffer {
  try {
    // Try base64 first
    if (ivString.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      const buffer = base64ToArrayBuffer(ivString);
      if (buffer.byteLength === 16) {
        return buffer;
      }
    }
    
    // Try hex
    const hexBuffer = hexToArrayBuffer(ivString);
    if (hexBuffer.byteLength === 16) {
      return hexBuffer;
    }
    
    throw new Error(`Invalid IV length: ${hexBuffer.byteLength} bytes (expected 16)`);
  } catch (error) {
    throw new Error(`Failed to parse IV: ${error}`);
  }
}

/**
 * Fetches encrypted PDF from server and decrypts it
 * Optimized for large files with progress tracking
 */
export async function fetchAndDecryptPdf(
  serverUrl: string = 'http://localhost:3000',
  onProgress?: (progress: number) => void
): Promise<ArrayBuffer> {
  try {
    console.log('Fetching encrypted PDF from server...');
    
    // Fetch encrypted data and decryption key in parallel
    const [encryptedResponse, keyResponse] = await Promise.all([
      fetch(`${serverUrl}/api/encrypted-pdf`),
      fetch(`${serverUrl}/api/decrypt-key`)
    ]);

    if (!encryptedResponse.ok) {
      throw new Error(`Failed to fetch encrypted PDF: ${encryptedResponse.statusText}`);
    }

    if (!keyResponse.ok) {
      throw new Error(`Failed to fetch decryption key: ${keyResponse.statusText}`);
    }

    const encryptedData: EncryptedData = await encryptedResponse.json();
    const decryptKey: DecryptKey = await keyResponse.json();

    if (!encryptedData.success) {
      throw new Error(`Server error: ${encryptedData.error}`);
    }

    console.log('Server response received:');
    console.log('- Original size:', encryptedData.originalSize, 'bytes');
    console.log('- Encrypted data length:', encryptedData.encryptedData.length);
    console.log('- IV:', encryptedData.iv);
    console.log('- Algorithm:', encryptedData.algorithm);

    onProgress?.(25);

    console.log('Decrypting PDF data...');
    
    // Decrypt the PDF data
    const decryptedBuffer = await decryptBuffer(
      encryptedData.encryptedData,
      decryptKey.key,
      encryptedData.iv,
      'AES-CBC'
    );

    onProgress?.(100);

    console.log(`PDF decrypted successfully, size: ${decryptedBuffer.byteLength} bytes`);
    
    // Validate decrypted size matches original
    if (decryptedBuffer.byteLength !== encryptedData.originalSize) {
      console.warn(`Size mismatch: expected ${encryptedData.originalSize}, got ${decryptedBuffer.byteLength}`);
    }
    
    return decryptedBuffer;
  } catch (error) {
    console.error('Error fetching and decrypting PDF:', error);
    throw error;
  }
}

/**
 * Creates a blob URL from ArrayBuffer for PDF viewing
 */
export function createPdfBlobUrl(pdfBuffer: ArrayBuffer): string {
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/**
 * Revokes a blob URL to free memory
 */
export function revokePdfBlobUrl(url: string): void {
  URL.revokeObjectURL(url);
}
