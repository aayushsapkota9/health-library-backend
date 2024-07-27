import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { uploadFileName } from 'src/helpers/file-name-helper';

export const GlobalFileUploadConfig: MulterOptions = {
  storage: diskStorage({
    destination: './upload',
    filename: uploadFileName,
  }),
};
