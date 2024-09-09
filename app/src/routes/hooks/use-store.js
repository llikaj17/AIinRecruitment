import { create } from 'zustand';

export const useStore = create((set) => ({
   botResponse: [],
   messages: [],
   jobs: [],
   resumes: [],
   shortlisted: [],
   chatConfigurations: {},

   addUserMessage: (message) => set((state) => ({ messages: [...state.messages, {referer: 'user', message: message}] } )),
   addSystemMessage: (message) => set((state) => ({ messages: [...state.messages, {referer: 'system', message: message}] } )),
   removeLastMessage: () => set((state) => {
      state.messages.pop();
      return ({ messages: state.messages })
   }),
   removeMessage: (index) => set(() => ({ messages: [] })),
   addBotResponse: (newBotResult) => set((state) => ({ botResponse: [...state.botResponse, newBotResult] } )),
   
   addResumes: (resumes) => set((state) => ({ resumes: [...state.resumes, ...resumes] } )),
   addJobs: (jobs) => set((state) => ({ jobs: [...state.jobs, ...jobs] } )),
   
   shortlistCandidate:  (shortlisted) => set(() => ({ shortlisted: [...shortlisted] } )),
   configureChat: (configs) => set((state) => ({ chatConfigurations: {...state.chatConfigurations, ...configs} } ))
}))

