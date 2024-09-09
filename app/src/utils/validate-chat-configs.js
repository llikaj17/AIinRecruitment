
export const validateChatConfigs = (configs) => {
   console.log(configs);
   return Object.keys(configs).length 
      && configs.apiKey?.length 
      && configs.modelTemp?.length 
      && configs.model?.length
      && configs.assistantMode?.length;
}