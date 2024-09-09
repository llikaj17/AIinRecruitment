import { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Paper from '@mui/material/Paper';
import Iconify from 'src/components/iconify';
import Fade from '@mui/material/Fade';
import { faker } from '@faker-js/faker';
import Scrollbar from 'src/components/scrollbar';
import Avatar from "@mui/material/Avatar";
import { deepOrange, green } from '@mui/material/colors';
import FileUploader from '/src/components/file-uploader/FileUploader';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { Alert, Divider } from '@mui/material';
import { useStore } from '/src/routes/hooks';
import CustomChatContent from '/src/components/modals/addCustomChatContentModal';
import { validateChatConfigs } from '/src/utils/validate-chat-configs';
import axios from 'axios';


// ----------------------------------------------------------------------


export const ChatConfigsMessage = () => {

   const existingJobs = useStore((state) => state.jobs);
   const configureJobs = useStore((state) => state.addJobs);
   const configurations = useStore((state) => state.chatConfigurations);
   const configureChat = useStore((state) => state.configureChat);

   const [files, setFiles] = useState([]);
   const [fileContent, setFileContent] = useState(''); // it should be a formated string :)
   const [assistantMode, setAssistantMode] = useState(configurations.assistantMode);
   const [addCustomData, setAddCustomData] = useState(false);
   const [jobDescriptions, setJobDescriptions] = useState({});

   const handleAssistantModeChange = (event) => {
      setAssistantMode(event.target.value);
      configureChat({assistantMode: event.target.value})
   };

   const handleJobDescriptionChange = (event) => {
      configureChat({
         jobDescription: event.target.value
      });
   };

   const handleResumeUpload = (event) => {
      configureChat({
         resumeContent: event.target.value
      });
   };

   useEffect(() => {
      if (!existingJobs.length) {
         axios.get('http://localhost:3000/api/v1/content/jobs')
            .then(response => {
               const entries = Object.entries(response.data).map(entry => entry[1]);
               const descr = {};
               entries.forEach(job => {
                  const jobTitle = job.job ?? '';
                  descr[jobTitle] = job.description.split('WE OFFER:')[0];
               });
               setJobDescriptions(descr);
               configureJobs(entries);
               console.log('Length 2: ', descr.length, Object.keys(descr).length);
            })
            .catch(error => {
               console.log(error);
            });
         return;
      }
      const descr = {};
      existingJobs.forEach(job => {
         const jobTitle = job.job ?? '';
         descr[jobTitle] = job.description.split('WE OFFER:')[0];
      });
      setJobDescriptions(descr);
      console.log('Length: ', descr.length, Object.keys(descr).length);
   }, []);

   return (
      <>
         <Card sx={{width: '75%', padding: '14px', paddingRight: 0, maxHeight: '1000px', marginBottom: '25px' }}>
            <Scrollbar>
               <CardContent sx={{maxHeight: '980px', alignItems: 'right', padding: '10px', paddingRight: '35px'}}>
                     <Stack>
                        <Stack direction={'row'}>
                           <Avatar sx={{ bgcolor: deepOrange[500], borderRadius: '8px' }} variant="square" >
                              <Iconify width={26}  icon="mdi:robot-outline" />
                           </Avatar>
                           <Stack marginLeft={'10px'}>
                              <Typography fontSize={'14px'} fontWeight={'bold'}>{'System'}</Typography>
                              <Typography fontSize={'14px'} color={'lightgray'}>{'2023-01-01'}</Typography>   
                           </Stack>
                        </Stack>
                        <Typography variant='h4' sx={{marginTop: '10px', marginBottom: '10px'}}>Configure Your Assistant 🤖 </Typography>

                        <FormControl fullWidth sx={{marginBottom: '20px'}}>
                           <InputLabel id="select-assistant-mode">Assistant Mode</InputLabel>
                           <Select
                              labelId="select-assistant-mode"
                              id="select-assistant-mode-configs"
                              label="Assistant Mode"
                              onChange={handleAssistantModeChange}
                              value={assistantMode}
                           >
                              <MenuItem value={'resume'}>Analyse Resume</MenuItem>
                              <MenuItem value={'job'}>Find Relevant Candidates</MenuItem>
                           </Select>
                        </FormControl>   

                        <Typography variant='p' color={'lightgray'}>
                           You can only upload <b>.txt</b>, <b>.pdf</b> and <b>.json</b> files at the moment. Support for other file types will follow.
                           <br></br>Select a file and then click <b>Upload</b>, or add a custom resume manually using the button below.
                        </Typography>

                        <FileUploader onFilesSelected={setFiles} mode={assistantMode} onFileContentSet={setFileContent} />

                        <Divider sx={{marginTop: '15px', bgcolor: '#0000011'}}/>
  
                        <Stack direction={'row'} width={'100%'} display={'flex'} marginTop={'15px'} justifyContent={'space-around'}>
                           {assistantMode === 'job' ? (
                              <Stack direction={'row'} sx={{display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                                 <FormControl sx={{width: '62%'}}>
                                    <InputLabel id="select-assistant-mode">Select Existing Jobs</InputLabel>
                                    {Object.keys(jobDescriptions).length && <Select
                                       labelId="select-existing-jobs"
                                       id="select-existing-jobs-configs"
                                       label="Select Existing Jobs"
                                       onChange={handleJobDescriptionChange}
                                    >
                                       {
                                          Object.keys(jobDescriptions).length && Object.entries(jobDescriptions).map(([title, description]) => ( <MenuItem key={faker.string.uuid()} value={description}>{title}</MenuItem>))
                                       }
                                    </Select>}
                                 </FormControl>
                                 <p style={{fontWeight: 'bold'}}>OR</p>
                                 <Button variant='contained' sx={{display: 'flex', justifyItems: 'center', alignItems: 'center', bgcolor: '#000c14'}} onClick={() => setAddCustomData(true)} >
                                    <Iconify width={25} style={{marginBottom: '5px', marginRight: '5px'}}  icon="hugeicons:job-search" />Add Job Description
                                 </Button>
                              </Stack>) : 
                           <Button variant='contained' fullWidth sx={{display: 'flex', justifyItems: 'center', alignItems: 'center', bgcolor: '#000c14'}} onClick={() => setAddCustomData(true)}>
                              <Iconify width={25} style={{marginBottom: '5px', marginRight: '5px'}}  icon="mdi:resume" />Add Custom Resume
                           </Button>}
                        </Stack>
                     </Stack>
                     <Alert sx={{marginTop: '15px'}} variant="filled" severity={validateChatConfigs(configurations) ? "success" : "warning"}>Your assistant is {validateChatConfigs(configurations) ? 'succesfully' : 'not properly'} configured!</Alert>
               </CardContent>
            </Scrollbar>
         </Card>
         {addCustomData && <CustomChatContent onCloseModal={() => setAddCustomData(false)} open={addCustomData} assistantMode={assistantMode} />}
      </>
   );
}

ChatConfigsMessage.propTypes = {

};
