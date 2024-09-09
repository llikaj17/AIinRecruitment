import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import {
   Container,
   TextField,
   Button,
   Grid,
   Typography,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   IconButton,
   Box,
   Alert,
   Stack,
} from '@mui/material';
import PropTypes from 'prop-types';
import { useStore } from '/src/routes/hooks';
import { faker } from '@faker-js/faker';

export default function Survey({ job, openSurvey, closeSurvey }) {

   const configurations = useStore((state) => state.chatConfigurations);
   const shortlisted = useStore((state) => state.shortlisted);
   const candidates = useStore((state) => state.resumes);

   console.log('Survey candidates: ', candidates);

   React.useEffect(() => {

   }, []);

   /*
   const [saved, setSaved] = React.useState(false);
   const [formData, setFormData] = React.useState({
      apiKey: configurations.apiKey,
      temperature: configurations.modelTemp,
      model: configurations.model,
      systemPrompt: configurations.customSystemPrompt
   });
   const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
   };
   */

   const [rating, setRating] = React.useState(null);
   const [numShortlisted, setNumShortlisted] = React.useState(3);
   const [shortlistSelections, setShortlistSelections] = React.useState(Array(numShortlisted).fill(''));
   const [comment, setComment] = React.useState('');

   const handleRatingClick = (value) => {
      setRating(value);
   };

   const handleComment = (event) => {
      setComment(event.target.value);
   }

   const handleNumShortlistedChange = (e) => {
      const value = parseInt(e.target.value, 10) || 0;
      setNumShortlisted(value);
      setShortlistSelections((prev) => {
         const newSelections = [...prev];
         if (value > newSelections.length) {
            return [...newSelections, ...Array(value - newSelections.length).fill('')];
         }
         return newSelections.slice(0, value);
      });
   };

   const handleShortlistChange = (index, event) => {
      const updatedSelections = [...shortlistSelections];
      updatedSelections[index] = event.target.value;
      setShortlistSelections(updatedSelections);
   };

   const incrementShortlisted = () => {
      if (numShortlisted > 9) {
         return;
      }
      setNumShortlisted((prev) => prev + 1);
      setShortlistSelections((prev) => [...prev, '']);
   };

   const decrementShortlisted = () => {
      if (numShortlisted > 1) {
         setNumShortlisted((prev) => prev - 1);
         setShortlistSelections((prev) => prev.slice(0, prev.length - 1));
      }
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const concatenatedData = `
        Rating: ${rating},
        Number of Shortlisted Candidates: ${numShortlisted},
        Shortlist Selections: ${shortlistSelections.join(', ')}
      `.replace(/\s+/g, ' ').trim();
      alert(`WIP: Functionallity is not implemented yet! Thank your for taking the survey. Submitted Data: ${concatenatedData}`);
   };

   const DrawerList = (
      <Container sx={{ padding: '25px', width: '800px' }}>
         <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
               Survey on using AI for shortlisting
            </Typography>
            <Box display="flex" alignItems="center">
               <IconButton onClick={decrementShortlisted}>
                  -
               </IconButton>
               <TextField
                  label="Shortlisted"
                  value={numShortlisted}
                  onChange={handleNumShortlistedChange}
                  variant="outlined"
                  size="small"
                  style={{ width: '180px' }}
                  disabled
                  inputProps={{ min: 1, max: 10 }}
               />
               <IconButton onClick={incrementShortlisted}>
                  +
               </IconButton>
            </Box>
         </Box>
         <Alert severity='warning' sx={{ marginTop: '20px' }}>
            WIP: We try to understand how HR would do the ranking. This way we compare the human behavior with AI generated response. However, this is just an experimental feature. It does not work properly yet.
         </Alert>
         <Typography variant='h4' sx={{ marginTop: '20px' }}>{job.job} AI Shortlisted</Typography>
         {shortlisted.map((candidate, index) => (<Typography key={index}>{index + 1}. {candidate.content.name || candidate.name} ({candidate.content.score || candidate.score})</Typography>))}
         <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <Grid container spacing={3}>
               <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                     How WOULD you rate the ranking or shortlisting?
                  </Typography>
                  <Stack direction={'row'} spacing={1}>
                     {[...Array(10)].map((_, index) => (
                        <Button
                           key={index + 1}
                           variant={rating === index + 1 ? 'contained' : 'outlined'}
                           color="primary"
                           onClick={() => handleRatingClick(index + 1)}
                        >
                           {index + 1}
                        </Button>
                     ))}
                  </Stack>
                  <TextField sx={{marginTop: '20px'}} onChange={(e) => handleComment(e)} fullWidth multiline rows={4} placeholder='Your comment'></TextField>
               </Grid>
               <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                     How would you do the shortlist?
                  </Typography>
                  {shortlistSelections.map((selection, index) => (
                     <FormControl fullWidth variant="outlined" margin="normal" key={index}>
                        <InputLabel>Candidate {index + 1}</InputLabel>
                        <Select
                           value={selection}
                           onChange={(event) => handleShortlistChange(index, event)}
                           label={`Candidate ${index + 1}`}
                        >
                           <MenuItem value=""><em>None</em></MenuItem>
                           {candidates.map(candidate => (<MenuItem key={faker.string.uuid()} value={candidate.content.name}>{candidate.content.name}</MenuItem>))}
                        </Select>
                     </FormControl>
                  ))}
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

   return (
      <div>
         <Drawer open={openSurvey} onClose={() => closeSurvey()}>
            {DrawerList}
         </Drawer>
      </div>
   );
}

Survey.propTypes = {
   closeSurvey: PropTypes.func,
   openSurvey: PropTypes.any,
   job: PropTypes.any
};
