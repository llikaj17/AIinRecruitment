const XLSX = require('xlsx');
const fs = require('fs');

// Note that this helper script is GENERATED WITH CHAT GPT or Co Pilot

/**
 * Function to process and compare decisions
 * @param {*} decision1 
 * @param {*} decision2 - usually this is also the 
 * @returns 
 */
const compareShortlistDecisions = (decision1, decision2) => {
   if (!decision1 || !decision2) {
      return false;
   }

   decision1 = decision1.trim().toLowerCase();
   decision2 = decision2.trim().toLowerCase();

   // onhold and rejected will be both considered as rejected
   return (decision1.includes('short list') && decision2.includes('short list')) ||
      (decision1.includes('short list') && decision2.includes('interview')) ||
      (decision1.includes('interview') && decision2.includes('short list'));
}

/**
 * Function to group and count distributions by a specified key
 * @param {*} data 
 * @param {*} key 
 * @returns 
 */
function groupAndCount(data, key) {
   return data.reduce((acc, row) => {
       const value = row[key];
       if (value) {
           acc[value] = (acc[value] || 0) + 1;
       }
       return acc;
   }, {});
}

const calculatePercentageDistribution = (counts, total) => {
   const percentages = {};
   for (const [key, value] of Object.entries(counts)) {
       percentages[key] = ((value / total) * 100).toFixed(2) + '%';
   }
   return percentages;
}

/**
 * Function to read and analyze Excel file
 *    columns: [
      'Candidate_Id',
      'Name',
      'Age_range',
      'Gender',
      'Nationality',
      'Highest_degree_obtained',
      'EU_citizen',
      'Position_applied_for',
      'Location',
      'Recruiter_decision',
      'HM_decision',
      'HM_comment',
      'Microsoft_copilot_rating',
      'Microsoft_copilot_decision',
      'Microsoft_copilot_comment',
      'Chatgpt_rating',
      'Chatgpt_decision',
      'Chatgpt_comment'
   ]
 * @param {*} filePath 
 * @returns 
 */
const readAndAnalyzeExcel = (filePath) => {
   const workbook = XLSX.readFile(filePath);
   const sheetName = workbook.SheetNames[0];
   const worksheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

   let recruiterTotal = 0;
   let msTotal = 0;
   let chatTotal = 0;
   let hmTotal = 0;
   let recruiterMSMatches = 0;
   let recruiterChatGPTMatches = 0;
   let msChatGPTMatches = 0;
   let chatGPTHMMatches = 0;
   let msHMMatches = 0;
   let recruitHMMatches = 0;
   const chatGPTShortlist = [];
   const msCopilotShortlist = [];
   const recruiterShortlist = [];
   const hmShortlist = [];

   worksheetData.forEach(row => {
      if (compareShortlistDecisions(row['Recruiter_decision'], row['Microsoft_copilot_decision'])) {
         recruiterMSMatches += 1;
      }
      if (compareShortlistDecisions(row['Recruiter_decision'], row['Chatgpt_decision'])) {
         recruiterChatGPTMatches += 1;
      }
      if (compareShortlistDecisions(row['Microsoft_copilot_decision'], row['Chatgpt_decision'])) {
         msChatGPTMatches += 1;
      }
      if (compareShortlistDecisions(row['Chatgpt_decision'], row['HM_decision'])) {
         chatGPTHMMatches += 1;
      }
      if (compareShortlistDecisions(row['Microsoft_copilot_decision'], row['HM_decision'])) {
         msHMMatches += 1;
      }
      if (compareShortlistDecisions(row['Recruiter_decision'], row['HM_decision'])) {
         recruitHMMatches += 1;
      }
      if (row['Recruiter_decision']?.length && row['Recruiter_decision'].toLowerCase().includes('short list')) {
         recruiterTotal += 1;
         recruiterShortlist.push(row);
      }
      if (row['Microsoft_copilot_decision']?.length && row['Microsoft_copilot_decision'].toLowerCase().includes('short list')) {
         msTotal += 1;
         msCopilotShortlist.push(row);
      }
      if (row['Chatgpt_decision']?.length && row['Chatgpt_decision'].toLowerCase().includes('short list')) {
         chatTotal += 1;
         chatGPTShortlist.push(row);
      }
      if (row['HM_decision']?.length && row['HM_decision'].toLowerCase().includes('interview')) {
         hmTotal += 1;
         hmShortlist.push(row);
      }
   });

   const chatGPTAgeDistribution = groupAndCount(chatGPTShortlist, 'Age_range');
   const chatGPTGenderDistribution = groupAndCount(chatGPTShortlist, 'Gender');
   const chatGPTEUCitizenDistribution = groupAndCount(chatGPTShortlist, 'EU_citizen');

   const msCopilotAgeDistribution = groupAndCount(msCopilotShortlist, 'Age_range');
   const msCopilotGenderDistribution = groupAndCount(msCopilotShortlist, 'Gender');
   const msCopilotEUCitizenDistribution = groupAndCount(msCopilotShortlist, 'EU_citizen');

   const recruiterAgeDistribution = groupAndCount(recruiterShortlist, 'Age_range');
   const recruiterGenderDistribution = groupAndCount(recruiterShortlist, 'Gender');
   const recruiterEUCitizenDistribution = groupAndCount(recruiterShortlist, 'EU_citizen');

   const hmAgeDistribution = groupAndCount(hmShortlist, 'Age_range');
   const hmGenderDistribution = groupAndCount(hmShortlist, 'Gender');
   const hmEUCitizenDistribution = groupAndCount(hmShortlist, 'EU_citizen');

   const chatGPTAgePercentage = calculatePercentageDistribution(chatGPTAgeDistribution, chatTotal);
   const chatGPTGenderPercentage = calculatePercentageDistribution(chatGPTGenderDistribution, chatTotal);
   const chatGPTEUCitizenPercentage = calculatePercentageDistribution(chatGPTEUCitizenDistribution, chatTotal);

   const msCopilotAgePercentage = calculatePercentageDistribution(msCopilotAgeDistribution, msTotal);
   const msCopilotGenderPercentage = calculatePercentageDistribution(msCopilotGenderDistribution, msTotal);
   const msCopilotEUCitizenPercentage = calculatePercentageDistribution(msCopilotEUCitizenDistribution, msTotal);

   const recruiterAgePercentage = calculatePercentageDistribution(recruiterAgeDistribution, recruiterTotal);
   const recruiterGenderPercentage = calculatePercentageDistribution(recruiterGenderDistribution, recruiterTotal);
   const recruiterEUCitizenPercentage = calculatePercentageDistribution(recruiterEUCitizenDistribution, recruiterTotal);

   const totalRows = worksheetData.length;

   console.log(`
      🔥 Results:
      - ${recruiterMSMatches}/${totalRows} matches between Recruiter (${recruiterTotal}) and Microsoft Copilot (${msTotal}) decisions.
      - ${recruiterChatGPTMatches}/${totalRows} matches between Recruiter (${recruiterTotal}) and ChatGPT (${chatTotal}) decisions.
      - ${msChatGPTMatches}/${totalRows} matches between Microsoft Copilot (${msTotal}) and ChatGPT (${chatTotal}) decisions.
      - ${chatGPTHMMatches}/${totalRows} matches between ChatGPT (${chatTotal}) and Hiring Manager (${hmTotal}) decisions.
      - ${msHMMatches}/${totalRows} matches between Microsoft Copilot (${msTotal}) and Hiring Manager (${hmTotal}) decisions.
      - ${recruitHMMatches}/${totalRows} shortlisted from the Recruiter (${recruiterTotal}) are interviewed by the Hiring Manager (${hmTotal}) decisions.

      ######################

      🔥 Analysis:
      ${(chatGPTHMMatches / chatTotal) * 100 } % of candidates shortlisted from ChatGPT will be interviewed by Hiring Manager
      ${(recruitHMMatches / recruiterTotal) * 100 } % of candidates shortlisted from real Recruiter will be interviewed by Hiring Manager
      ${(msHMMatches / msTotal) * 100 } % of candidates shortlisted from Co-Pilot will be interviewed by Hiring Manager

      --------------------

      🎉 Distribution of Shortlisted Candidates by Decision Source:

      ChatGPT Decision:
      - Age Distribution: ${JSON.stringify(chatGPTAgeDistribution)}, ${JSON.stringify(chatGPTAgePercentage)}
      - Gender Distribution: ${JSON.stringify(chatGPTGenderDistribution)}, ${JSON.stringify(chatGPTGenderPercentage)}
      - EU Citizen Distribution: ${JSON.stringify(chatGPTEUCitizenDistribution)}, ${JSON.stringify(chatGPTEUCitizenPercentage)}

      Microsoft Copilot Decision:
      - Age Distribution: ${JSON.stringify(msCopilotAgeDistribution)}, ${JSON.stringify(msCopilotAgePercentage)}
      - Gender Distribution: ${JSON.stringify(msCopilotGenderDistribution)}, ${JSON.stringify(msCopilotGenderPercentage)}
      - EU Citizen Distribution: ${JSON.stringify(msCopilotEUCitizenDistribution)}, ${JSON.stringify(msCopilotEUCitizenPercentage)}

      Recruiter Decision:
      - Age Distribution: ${JSON.stringify(recruiterAgeDistribution)}, ${JSON.stringify(recruiterAgePercentage)}
      - Gender Distribution: ${JSON.stringify(recruiterGenderDistribution)}, ${JSON.stringify(recruiterGenderPercentage)}
      - EU Citizen Distribution: ${JSON.stringify(recruiterEUCitizenDistribution)}, ${JSON.stringify(recruiterEUCitizenPercentage)}
      
      HM Decision:
      - Age Distribution: ${JSON.stringify(hmAgeDistribution)}
      - Gender Distribution: ${JSON.stringify(hmGenderDistribution)}
      - EU Citizen Distribution: ${JSON.stringify(hmEUCitizenDistribution)}

      ######################

      🎉 Well done! The analysis is complete!
   `);

   const analysis = {
      totalRows: worksheetData.length,
      columns: Object.keys(worksheetData[0]),
      summary: {}
   };

   const firstColumn = analysis.columns[0];
   const uniqueValues = new Set(worksheetData.map(row => row[firstColumn]));

   analysis.summary[firstColumn] = {
      uniqueValuesCount: uniqueValues.size,
      sampleValues: Array.from(uniqueValues).slice(0, 5)
   };

   return analysis;
}

const filePath = '../data/experiments/shortlisting_results.xlsx';
const analysisResult = readAndAnalyzeExcel(filePath);
console.log(analysisResult);

/**
 * 
  🔥 Results:
      - 56/102 matches between Recruiter (69) and Microsoft Copilot (73) decisions.
      - 36/102 matches between Recruiter (69) and ChatGPT (38) decisions.
      - 36/102 matches between Microsoft Copilot (73) and ChatGPT (38) decisions.
      - 25/102 matches between ChatGPT (38) and Hiring Manager (39) decisions.
      - 33/102 matches between Microsoft Copilot (73) and Hiring Manager (39) decisions.
      - 39/102 shortlisted from the Recruiter (69) are interviewed by the Hiring Manager (39) decisions.

      ######################

   🔥 Analysis:
      65.78947368421053 % of candidates shortlisted from ChatGPT will be interviewed by Hiring Manager
      56.52173913043478 % of candidates shortlisted from real Recruiter will be interviewed by Hiring Manager
      45.20547945205479 % of candidates shortlisted from Co-Pilot will be interviewed by Hiring Manager

      --------------------

   🎉 Distribution of Shortlisted Candidates by Decision Source:

      ChatGPT Decision:
      - Age Distribution: {"31-45":30,"17-30":3,"Above 45":5}, {"31-45":"78.95%","17-30":"7.89%","Above 45":"13.16%"}
      - Gender Distribution: {"Male":15,"Female":23}, {"Male":"39.47%","Female":"60.53%"}
      - EU Citizen Distribution: {"EU Citizen":25,"Non-EU Citizen":13}, {"EU Citizen":"65.79%","Non-EU Citizen":"34.21%"}

      Microsoft Copilot Decision:
      - Age Distribution: {"31-45":49,"17-30":19,"Above 45":5}, {"31-45":"67.12%","17-30":"26.03%","Above 45":"6.85%"}
      - Gender Distribution: {"Male":28,"Female":45}, {"Male":"38.36%","Female":"61.64%"}
      - EU Citizen Distribution: {"EU Citizen":46,"Non-EU Citizen":27}, {"EU Citizen":"63.01%","Non-EU Citizen":"36.99%"}

      Recruiter Decision:
      - Age Distribution: {"31-45":50,"17-30":14,"Above 45":5}, {"31-45":"72.46%","17-30":"20.29%","Above 45":"7.25%"}
      - Gender Distribution: {"Male":29,"Female":40}, {"Male":"42.03%","Female":"57.97%"}
      - EU Citizen Distribution: {"EU Citizen":41,"Non-EU Citizen":28}, {"EU Citizen":"59.42%","Non-EU Citizen":"40.58%"}
      
      HM Decision:
      - Age Distribution: {"31-45":27,"Above 45":3,"17-30":9}
      - Gender Distribution: {"Male":15,"Female":24}
      - EU Citizen Distribution: {"EU Citizen":25,"Non-EU Citizen":14}

      ######################

   🎉 Well done! The analysis is complete!
 */