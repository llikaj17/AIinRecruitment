import React, { useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import Scrollbar from '../scrollbar';

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

export default function JobModal(props) {
   const handleClose = () => props ? props.onCloseModal() : console.log();
   const job = props ? props.job : {};
   console.log(job);
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
         <Fade in={ props.open ?? false }>
            <Box sx={style}>
               <Scrollbar></Scrollbar>
               <Typography variant="h3" component="h3">
                  {job.content.title}
               </Typography>
               <Typography mt={3} >
                  {job.content.description}
               </Typography>
               <Typography variant="h5" mt={3} >
                  Responsibilities:
               </Typography>
               <Typography>
                  {job.content.responsibilites}
               </Typography>
               <Typography variant="h5" mt={3} >
                  Your Profile:
               </Typography>
               <Typography>
                  {job.content.profile}
               </Typography>
               <Typography variant="h5" mt={3} >
                  Offer:
               </Typography>
               <Typography>
                  {job.content.offer}
               </Typography>
            </Box>
         </Fade>
         </Modal>
      </div>
   );
}

JobModal.propTypes = {
   job: PropTypes.any,
   open: PropTypes.boolean,
   onCloseModal: PropTypes.func
 };
 