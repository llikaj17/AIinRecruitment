import { JsonDB, Config } from 'node-json-db';
import { Applicant } from './ApplicantsService.js';
import { FileHelperUtils } from '../utils/FileHelper.utils.js';

// Only used to load resumes and jobs from config.  
// Connection to database is not fully implemented yet
export class ApplicationStorageService {
   db: JsonDB;
   lastId: number;
   fileUtils: FileHelperUtils;

   constructor() {
      this.db = new JsonDB(new Config("myDatabase", true, false, '/'));
      this.lastId = this.getLastInsertedId();
      this.fileUtils = new FileHelperUtils();
   }

   addDataToDb = (applicant: Applicant) => {
      this.lastId = this.getLastInsertedId() + 1;
      applicant.id = this.lastId;
      return applicant.id;
   }

   getAllDataFromDb = () => {

   }

   getDataFromDb = (applicantId: string) => {

   }

   removeDataFromDb = (applicantId: string) => {

   }

   private getLastInsertedId = () => {
      return 0;
   }


   // Load hardcoded data/configs from storage
   loadResumes = async () => {
      return await this.fileUtils.readDataFromJsonFiles('src/configs/resumes');
   }

   loadJobs = async () => {
      return await this.fileUtils.readDataFromJsonFiles('src/configs/jobs');
   }
}