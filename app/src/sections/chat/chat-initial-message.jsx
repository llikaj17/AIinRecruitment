import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import Avatar from "@mui/material/Avatar";
import Button from '@mui/material/Button';
import { deepOrange } from '@mui/material/colors';
import SettingsDrawer from '/src/components/drawer/Drawer';

// ----------------------------------------------------------------------

export const ChatInitialMessage = () => {
   const [openSettingsDrawer, setOpenSettingDrawer] = useState(false);

   const closeSettingsDrawer = () => {
      setOpenSettingDrawer(false);
   }

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
                        <Typography variant='h4' sx={{marginTop: '10px', marginBottom: '10px'}}>Hello there 👋,</Typography>
                        <Typography variant='p'>This is a prototype ot test RAG 🤖 pipeline simulating a Resume Screening 📋 using an AI Assistant that can understand a job description and a resume content.</Typography>
                        
                        <ul>
                           <li><Typography variant='p'>We use similarity search to get the most relevant resumes and job descriptions from our vector database.</Typography></li>
                           <li>We then use 🤖 AI (specifically Chat GPT API) to analyze and make a decision based on candidate score</li>
                           <li>The sidebar (i.e. settings menu) contains important information 💬 and explanation.</li>
                           <b style={{color: 'red'}}>Please read it carefully and configure your model.</b> ⁉️
                        </ul>
                        <Typography variant='h6' sx={{marginTop: '10px', marginBottom: '10px'}}>Please, do not upload any sensitive/private information.</Typography>

                        <Typography variant='h4' sx={{marginTop: '10px', marginBottom: '10px'}}>Getting Started 🚀</Typography>
                        
                        <Typography variant='p'>You should first upload a resume OR add new applicant using our interactive process. Feel free to choose.</Typography>
                        
                        <ol>
                           <li><Typography>Do you have an <b><a href='https://platform.openai.com/playground' rel='noopener noreferrer' target='_blank'>Open AI API</a> Key</b> 🔑. </Typography></li>
                           
                           <li>
                              <Typography 
                                 variant='p' 
                                 display={'flex'} 
                                 alignItems={'center'}>
                                    Configure your AI assistant 🦾 specifications. 
                                 <Button 
                                    variant='contained' 
                                    sx={{
                                       display: 'flex', 
                                       flexDirection: 'row', 
                                       justifyItems: 'center', 
                                       alignItems: 'center', 
                                       marginLeft: '10px',
                                       padding: '8px', 
                                       bgcolor: '#000c14'
                                    }}
                                    onClick={() => setOpenSettingDrawer(true)}
                                 >
                                    <Iconify width={26} style={{marginBottom: '5px', marginRight: '5px'}}  icon="mdi:robot-love-outline" />Assistant Settings
                                 </Button>
                              </Typography>
                           </li>

                           {/* <li> Are you trying to get best relevant candidate for a job. Then upload a job description. Alternatively, you can upload a resume and select the job description and it will get the best candidate. Select the checkbox on how to use the tool.</li> */}
                           {/* <li><Typography>After you chose the model you should select for which job you want to analyse the content. This will allow the system to achieve best outcome and retreive the most suitable description from our databse.</Typography></li> */}
                        </ol>
                     </Stack>
               </CardContent>
            </Scrollbar>
         </Card>
         {openSettingsDrawer && <SettingsDrawer openDrawer={openSettingsDrawer} onCloseDrawer={closeSettingsDrawer} />}
      </>
   );
}

