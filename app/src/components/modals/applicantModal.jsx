import React, { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Scrollbar from '../scrollbar';
import { Divider } from '@mui/material';
import { faker } from '@faker-js/faker';

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

export default function ApplicantModal(props) {
   const applicant = props ? props.applicant : {};
   console.log(applicant)
   const open = props.open ?? false;
   const handleClose = () => props ? props.onCloseModal() : console.log();

   return (
      <div>
         <Modal
         aria-labelledby="transition-modal-title"
         aria-describedby="transition-modal-description"
         open={open}
         onClose={handleClose}
         closeAfterTransition
         slots={{ backdrop: Backdrop }}
         slotProps={{
            backdrop: {
               timeout: 500,
            },
         }}
         >
         <Fade in={open}>
            <Box sx={style}>
               <Scrollbar>
               <Typography variant="h3" component="h3">
                  {applicant.name}
               </Typography>
               <Typography variant="h5" component="h5">
                  {applicant.personal.Gender} - {applicant.personal.Age}, {applicant.personal.Nationality} 
               </Typography>
               <Typography>
                  Score: {applicant.score}
               </Typography>
               <br></br>
               <Divider />
               <br></br>
               
               <Typography variant="h4" component="h4">
                  Education:
               </Typography>
               {applicant.education.map(val => (
                  <Typography key={faker.string.uuid()}>
                     {val}
                  </Typography>
               ))}
               <br></br>

               <Typography variant="h4" component="h4">
                  Experience:
               </Typography>
               {applicant.experience.map(val => (
                  <Typography key={faker.string.uuid()}>
                     {val.position} @ {val.company}, {val.period} More...
                  </Typography>
               ))}
               <br></br>

               <Typography variant="h4" component="h4">
                  Skills:
               </Typography>
               {applicant.skills.map(val => (
                  <Typography key={faker.string.uuid()}>
                     {val}
                  </Typography>
               ))}
            </Scrollbar>
            </Box>
            
         </Fade>
         </Modal>
      </div>
   );
}

ApplicantModal.propTypes = {
   applicant: PropTypes.any,
   open: PropTypes.any,
   onCloseModal: PropTypes.func
};


