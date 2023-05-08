import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
// const fs = require('fs');
import * as fs from 'fs';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const FileType = require('file-type');

import path = require('path');

type validFileExtension = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtensions: validFileExtension[] = ['png', 'jpg', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;
      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};

// export const isFileExtensionSafe = (
//   fullFilePath: string,
// ): Observable<boolean> => {
//   return from(FileType.fileTypeFromFile(fullFilePath)).pipe(
//     switchMap((fileExtensionAndMimeType: FileType.FileTypeResult) => {
//       if (!fileExtensionAndMimeType) return of(false);

//       const isFileTypeLegit = fileExtensionAndMimeType.ext;
//       const isMimeTypeLegit = validMimeTypes.includes(fileExtensionAndMimeType.mime);
//       const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
//       return of(isFileLegit);
//     }),
//   );
// };

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.error(err);
  }
};
