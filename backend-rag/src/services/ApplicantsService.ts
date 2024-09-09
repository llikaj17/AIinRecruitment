import { JobOpening } from "./JobOpeningService.js";

export interface Applicant {
   id?: number;
   name: string;
   age: number;
   gender: string;
   status: boolean;
   resume: string;
   applications: JobOpening[] | [];
}

export interface Appplication {
   id: string;
   job: JobOpening;
   applications: Applicant[]
}

export interface IApplicantService {
   getApplicants: () => Applicant[];
   addNewApplicant: (data: any) => void;
   removeApplicantWithId: (applicantId: number) => number;
}

/**
 * 
 * Implementation of the service to add new applicant -  Not implemented yet
 * TODO: Add this for the future (Good enough for current thesis)
 * 
export class ApplicantsService implements IApplicantService {
   getApplicants: () => {

   };

   addNewApplicant: (data: any) => {

   }

   removeApplicantWithId: (applicantId: number) => {
      
   }
}
*/
