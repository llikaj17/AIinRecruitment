import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

export class FileHelperUtils {
   constructor() {}

   ensureDirectoryExists = (dir: string) => {
      if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
      }
   };

   // Function to read all PDF files from a directory and its subdirectories
   protected readFilesFromDir = async (dir: string) => {
      const readdir = util.promisify(fs.readdir);
      const fileList: string[] = [];
      const files = await readdir(dir, { withFileTypes: true });
      files.map(file => {
         if (file.name.includes('.json')) {}
         fileList.push(path.join(dir, file.name));
      });
      return fileList;
   };

   protected parseJSONFile = async (filePath: string) => {
      const readfile = util.promisify(fs.readFile);
      const data: any = await readfile(filePath);
      return JSON.parse(data);
   };

   readDataFromJsonFiles = async (dir: string) => {
      const parsedData = [];
      const jsonFiles = await this.readFilesFromDir(dir) ?? [];
      for (const jsonFile of jsonFiles) {
         const parsedText = await this.parseJSONFile(jsonFile);
         parsedData.push(parsedText);
      }
      return parsedData;
   }

}