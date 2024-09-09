import React, { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Scrollbar from '../scrollbar';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import {
   Container,
   Stack,
   Chip,
   Grid,
   Select,
   MenuItem,
   InputLabel,
   FormControl,
   Divider
} from '@mui/material';
import { useStore } from '/src/routes/hooks';

const style = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 900,
   bgcolor: 'background.paper',
   p: 4,
   maxHeight: '800px',
   borderRadius: '13px',
   overflowY: 'scroll'
};

////////////////////////////////////////////////////////////////////////////////
// There are 2 elements here one for adding resume one for adding job
////////////////////////////////////////////////////////////////////////////////

const ResumeForm = () => {
   const configureChat = useStore((state) => state.configureChat);

   const [formData, setFormData] = useState({
      name: '',
      age: '',
      gender: '',
      nationality: '',
      experience: '',
      education: '',
      other: '',
      skills: [],
      skillInput: '',
   });

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSkillInputChange = (e) => {
      setFormData({ ...formData, skillInput: e.target.value });
   };

   const handleAddSkill = () => {
      if (formData.skillInput.trim()) {
         setFormData((prev) => ({
            ...prev,
            skills: [...prev.skills, prev.skillInput.trim()],
            skillInput: '',
         }));
      }
   };

   const handleDeleteSkill = (skillToDelete) => () => {
      setFormData((prev) => ({
         ...prev,
         skills: prev.skills.filter((skill) => skill !== skillToDelete),
      }));
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const concatenatedData = `
       Name: ${formData.name},
       Age: ${formData.age},
       Gender: ${formData.gender},
       Nationality: ${formData.nationality},
       Experience: ${formData.experience},
       Education: ${formData.education},
       Skills: ${formData.skills.join(', ')},
       Other: ${formData.other}
     `.replace(/\s+/g, ' ').trim();

      configureChat({resume: concatenatedData});
      alert('Custom resume is saved!');
   };

   return (
      <Container maxWidth="lg">
         <form onSubmit={handleSubmit}>
            <Stack direction={'row'} spacing={3}>
            <Grid container spacing={3} width={'60%'}>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Name"
                     name="name"
                     value={formData.name}
                     onChange={handleChange}
                     variant="outlined"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Age"
                     name="age"
                     value={formData.age}
                     onChange={handleChange}
                     variant="outlined"
                     type="number"
                  />
               </Grid>
               <Grid item xs={12}>
                  <FormControl fullWidth>
                     <InputLabel>Gender</InputLabel>
                     <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        variant="outlined"
                        label="Gender"
                     >
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                     </Select>
                  </FormControl>
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Nationality"
                     name="nationality"
                     value={formData.nationality}
                     onChange={handleChange}
                     variant="outlined"
                  />
               </Grid>
               <Divider sx={{marginBottom: '200px'}} />
               <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                     Submit
                  </Button>
               </Grid>
            </Grid>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Experience"
                     name="experience"
                     value={formData.experience}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Education"
                     name="education"
                     value={formData.education}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                     <TextField
                        label="Skills"
                        name="skillInput"
                        value={formData.skillInput}
                        onChange={handleSkillInputChange}
                        variant="outlined"
                        fullWidth
                     />
                     <Button variant="contained" color="primary" onClick={handleAddSkill} style={{ marginLeft: '10px' }}>
                        Add
                     </Button>
                  </Box>
                  <Box mt={2}>
                     {formData.skills.map((skill, index) => (
                        <Chip
                           key={index}
                           label={skill}
                           onDelete={handleDeleteSkill(skill)}
                           style={{ marginRight: '5px', marginBottom: '5px', overflow: 'hidden', maxWidth: '200px'}}
                        />
                     ))}
                  </Box>
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Other"
                     name="other"
                     value={formData.other}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
            </Grid>
            </Stack>
            
         </form>
      </Container>
   );
};

////////////////////////////////////////////////////////////////////////////////
// There are 2 modal here one for adding resume one for adding job
////////////////////////////////////////////////////////////////////////////////

const JobForm = () => {
   const configureChat = useStore((state) => state.configureChat);

   const [formData, setFormData] = useState({
      jobTitle: '',
      description: '',
      responsibilities: '',
      expectations: '',
      otherDetails: '',
      skills: [],
      skillInput: '',
   });

   const handleChange = (e) => {
      setFormData({
         ...formData,
         [e.target.name]: e.target.value,
      });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const concatenatedData = `
       Job Title: ${formData.jobTitle},
       Description: ${formData.description},
       Responsibilities: ${formData.responsibilities},
       Expectations: ${formData.expectations},
       Skills: ${formData.skills.join(', ')},
       Other Details: ${formData.otherDetails}
     `.replace(/\s+/g, ' ').trim();
      configureChat({jobDescription: concatenatedData});
      alert('Custom job description is saved!');
   };

   return (
      <Container maxWidth="sm">
         <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Job Title"
                     name="jobTitle"
                     value={formData.jobTitle}
                     onChange={handleChange}
                     variant="outlined"
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Description"
                     name="description"
                     value={formData.description}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Job Responsibilities"
                     name="responsibilities"
                     value={formData.responsibilities}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <TextField
                     fullWidth
                     label="Job Expectations (Your Profile)"
                     name="expectations"
                     value={formData.expectations}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <Typography sx={{marginBottom: '10px'}}>Note that we do not need the job offer here as it does not add much to the context of AI when selecting best candidate.</Typography>
                  <TextField
                     fullWidth
                     label="Other Details"
                     name="otherDetails"
                     value={formData.otherDetails}
                     onChange={handleChange}
                     variant="outlined"
                     multiline
                     rows={4}
                     maxRows={10}
                  />
               </Grid>
               <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                     Submit
                  </Button>
               </Grid>
            </Grid>
         </form>
      </Container>
   );
};


export default function CustomChatContent(props) {
   const [advancedWitingMode, setAdvancedWritingMode] = useState(false);
   const configureChat = useStore((state) => state.configureChat);
   const configs = useStore((state) => state.chatConfigurations);

   const handleClose = () => props ? props.onCloseModal() : console.log();
   const handleNewData = () => {
      alert('Settings are saved!');
      handleClose();
   }
   const assistantMode = props.assistantMode || configs.assistantMode;

   return (
      <div>
         <Modal
            aria-labelledby="transition-modal-title"
            aria-describedby="transition-modal-description"
            open={props.open}
            onClose={handleClose}
            closeAfterTransition
            slots={{ backdrop: Backdrop }}
            slotProps={{
               backdrop: {
                  timeout: 500,
               },
            }}
         >
            <Fade in={props.open ?? false}>
               <Box sx={style}>
                  <Typography variant='h2'>Custom Data Creation</Typography>
                  <FormGroup>
                     <FormControlLabel control={<Checkbox onClick={() => setAdvancedWritingMode(!advancedWitingMode)} />} label="Advanced Data Management" />
                  </FormGroup>
                  <Stack direction={'column'}>
                     {advancedWitingMode
                        ?
                        <Stack>
                           {assistantMode === 'resume' ?
                              <>
                                 <ResumeForm />
                              </>
                              : <>
                                 <JobForm />
                              </>
                           }
                        </Stack>
                        : <>
                           {assistantMode === 'job' && <Typography sx={{marginBottom: '10px'}}>Note that we do not need the job offer here as it does not add much to the context of AI when selecting best candidate.</Typography>}
                           <TextField
                              onChange={(e) => {
                                 configureChat(assistantMode === 'job' ?  {'jobDescription': e.target.value} : {'resume': e.target.value})}
                              } 
                              placeholder={`Type ${assistantMode} description in here`} 
                              multiline
                              rows={15} 
                              maxRows={25}
                              value={assistantMode === 'resume' ? configs.resume : configs.jobDescription}
                           />
                           <Button onClick={handleNewData} sx={{ marginTop: '15px' }} variant='outlined'>Save</Button>
                        </>
                     }
                  </Stack>
               </Box>
            </Fade>
         </Modal>
      </div>
   );
}

CustomChatContent.propTypes = {
   open: PropTypes.any,
   onCloseModal: PropTypes.func,
   assistantMode: PropTypes.string
};
