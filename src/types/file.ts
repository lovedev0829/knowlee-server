export interface MulterFile {
  fieldname: string;         // Field name specified in the form
  originalname: string;      // Name of the file on the user's computer
  encoding: string;          // Encoding type of the file
  mimetype: string;          // Mime type of the file
  size: number;              // Size of the file in bytes
  destination: string;       // The folder to which the file has been saved (DiskStorage)
  filename: string;          // The name of the file within the destination (DiskStorage)
  path: string;              // The full path to the uploaded file (DiskStorage)
  buffer: Buffer;            // A buffer of the entire file (MemoryStorage)
}