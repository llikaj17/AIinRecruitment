import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Iconify from 'src/components/iconify';
import {
   Switch,
   TextField,
   Button,
   Grid,
   Typography,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   Box,
   Alert,
   Tooltip,
   Stack,
 } from '@mui/material';
import PropTypes from 'prop-types';
import { useStore } from '/src/routes/hooks';

export default function SettingsDrawer({onCloseDrawer, openDrawer}) {
   const configurations = useStore((state) => state.chatConfigurations);
   const configureChat = useStore((state) => state.configureChat);   

   const [saved, setSaved] = React.useState(false);
   const [formData, setFormData] = React.useState({
      apiKey: configurations.apiKey,
      temperature: configurations.modelTemp,
      model: configurations.model,
      ragFusionFlag: configurations.ragFusionFlag ?? false,
      systemPrompt: configurations.customSystemPrompt
   });

   const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
   };

   const handleRagFusionSwitch = () => {
      setFormData({
        ...formData,
        'ragFusionFlag': !formData.ragFusionFlag,
      });
   };
  
   const handleSubmit = (e) => {
      e.preventDefault();
      configureChat({
         'apiKey': formData.apiKey,
         'modelTemp': formData.temperature,
         'model': formData.model,
         'customSystemPrompt': formData.systemPrompt,
         'ragFusionFlag': formData.ragFusionFlag
      });
      setSaved(true);
   };

   const DrawerList = (
      <Box sx={{ width: 700, padding: '30px' }} role="presentation" >
         <Button sx={{position: 'absolute', right: '6%'}} onClick={() => onCloseDrawer()}>Close</Button>
         <Typography variant="h4" gutterBottom sx={{marginBottom: '35px'}}>
            OpenAI GPT Configuration
         </Typography>
         <form onSubmit={handleSubmit} >
            <Grid container spacing={3} sx={{width: '100%'}}>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="OpenAI API Key"
                     name="apiKey"
                     type="password"
                     value={formData.apiKey}
                     onChange={handleChange}
                     required
                     variant="outlined"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Temperature"
                     name="temperature"
                     value={formData.temperature}
                     onChange={handleChange}
                     variant="outlined"
                     type="number"
                     required
                     inputProps={{ step: 0.1, min: 0, max: 1 }}
                  />
               </Grid>
               <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" required>
                     <InputLabel>Model</InputLabel>
                     <Select
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        label="Model"
                     >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="gpt-3.5">gpt-3.5</MenuItem>
                        <MenuItem value="gpt-4">gpt-4</MenuItem>
                        <MenuItem value="gpt-4o">gpt-4o</MenuItem>
                        <MenuItem value="gpt-4-turbo">gpt-4-turbo</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item xs={12}>
                  <Stack direction={'row'} spacing={1} sx={{display: 'flex', alignItems: 'center', margin: 0}}>
                     <Switch label={'Enable RAG Fusion Pipeline'} onClick={() => handleRagFusionSwitch()} /> 
                     Enable RAG Fusion Pipeline
                     <Tooltip title="RAG-Fusion combines RAG and reciprocal rank fusion (RRF) by generating multiple queries, reranking them with reciprocal scores and fusing the documents and scores. RAG-Fusion is able to provide accurate and comprehensive answers due to the generated queries contextualizing the original query from various perspectives. See https://arxiv.org/abs/2402.03367" arrow>
                        <Iconify width={26}  icon="clarity:info-solid" /> 
                     </Tooltip>
                  </Stack>
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Custom System Prompt [Optional]"
                     name="custom-system-prompt"
                     value={formData.systemPrompt}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={5}
                     maxRows={10}
                  />
               </Grid>

               <Grid item xs={12}>
                  <Divider sx={{marginBottom: '20px'}}/>

                  <Typography sx={{marginTop: '20px'}}>
                     By deafult, our system is using simple RAG pipelin (Retrieval Augmented Generation). 
                     It searches through our vector database for matching resumes based on job description 
                     and fed the retrieved resumes as a context to LLM to support in decision making and providing better details. 
                     The retrieval uses cosine similarity to match embeddings of resumes with embeddings of descripion.
                     Open AI Embedder model is used. Read the documentation for more.
                  </Typography>
                  <List>
                     {['Documentation'].map((text, index) => (
                        <ListItem key={text} disablePadding>
                           <ListItemButton>
                           <ListItemIcon>
                              <Iconify width={26}  icon="mdi:robot-outline" /> 
                           </ListItemIcon>
                           <ListItemText primary={text} />
                           </ListItemButton>
                        </ListItem>
                     ))}
                  </List>
               </Grid>
               
               <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" sx={{width: '300px', position: 'absolute', bottom: '1%', right: '10%'}}>
                     Save Configurations
                  </Button>
                  {saved && <Alert severity="success" fullWidth sx={{position: 'absolute', bottom: '15%', width: '600px'}}>Settigns are saved!</Alert>}

               </Grid>
            </Grid>
         </form>

      </Box>
   );

   return (
      <div>
         <Drawer open={openDrawer} onClose={() => onCloseDrawer()}>
            {DrawerList}
         </Drawer>
      </div>
      );
}

SettingsDrawer.propTypes = {
   onCloseDrawer: PropTypes.func,
   openDrawer: PropTypes.any
};
