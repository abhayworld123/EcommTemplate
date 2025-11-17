import * as XLSX from 'xlsx';
import { ExcelProductRow, Product } from '@/types';

export function parseExcelFile(file: File): Promise<ExcelProductRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const isCSV = file.name.toLowerCase().endsWith('.csv');
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;
        
        if (isCSV) {
          // For CSV files, read as text and parse with CSV options
          const text = data as string;
          workbook = XLSX.read(text, { 
            type: 'string',
            raw: false,
          });
        } else {
          // For Excel files, read as binary
          workbook = XLSX.read(data, { type: 'binary' });
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<ExcelProductRow>(worksheet, {
          defval: '', // Default value for empty cells
        });
        
        // Validate and clean data
        const validated = jsonData.map((row) => ({
          name: String(row.name || '').trim(),
          description: String(row.description || '').trim(),
          price: parseFloat(String(row.price || 0)),
          image_url: String(row.image_url || '').trim(),
          category: String(row.category || '').trim(),
          stock: parseInt(String(row.stock || 0), 10),
          featured: row.featured === true || row.featured === 'true' || row.featured === 'TRUE' || row.featured === '1',
        })).filter((row) => row.name && row.price > 0);
        
        resolve(validated);
      } catch (error) {
        reject(new Error('Failed to parse file: ' + (error as Error).message));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read CSV as text, Excel as binary
    if (isCSV) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

export function parseExcelBuffer(buffer: Buffer, filename?: string): ExcelProductRow[] {
  try {
    const isCSV = filename?.toLowerCase().endsWith('.csv') || false;
    let workbook: XLSX.WorkBook;
    
    if (isCSV) {
      // For CSV, convert buffer to string
      const text = buffer.toString('utf-8');
      workbook = XLSX.read(text, {
        type: 'string',
        raw: false,
      });
    } else {
      // For Excel files, use buffer directly
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json<ExcelProductRow>(worksheet, {
      defval: '',
    });
    
    return jsonData.map((row) => ({
      name: String(row.name || '').trim(),
      description: String(row.description || '').trim(),
      price: parseFloat(String(row.price || 0)),
      image_url: String(row.image_url || '').trim(),
      category: String(row.category || '').trim(),
      stock: parseInt(String(row.stock || 0), 10),
      featured: row.featured === true || row.featured === 'true' || row.featured === 'TRUE' || row.featured === '1',
    })).filter((row) => row.name && row.price > 0);
  } catch (error) {
    throw new Error('Failed to parse file buffer: ' + (error as Error).message);
  }
}

export function convertToProducts(rows: ExcelProductRow[]): Omit<Product, 'id' | 'created_at' | 'updated_at'>[] {
  return rows.map((row) => ({
    name: row.name,
    description: row.description,
    price: row.price,
    image_url: row.image_url,
    category: row.category,
    stock: row.stock,
    featured: Boolean(row.featured),
  }));
}

