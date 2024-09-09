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
import { Divider } from '@mui/material';

// ----------------------------------------------------------------------


export const ChatBubble = ({data}) => {
   const user = data.user ?? '';
   const text = data.text ?? '';
   const date = data.date ?? '';
   const content = data.content ?? <></>;
   const actions = data.actions ?? <></>;
   
   return (
      <>
         <Card sx={{width: user === 'system' ? '75%' : '50%', padding: '14px', paddingRight: 0, maxHeight: '730px', marginBottom: '25px', marginLeft: user === 'system' ? 0 : '49%'}}>
            <Scrollbar>
               <CardContent sx={{maxHeight: '700px', alignItems: 'right', padding: '10px', paddingRight: '35px'}}>
                     <Stack>
                        <Stack direction={'row'}>
                           <Avatar sx={{ bgcolor: user === 'user' ? green[500] : deepOrange[500], borderRadius: '8px' }} variant="square" >
                              { user === 'user' ? <Iconify width={26} icon="hugeicons:bubble-chat-user" /> : <Iconify width={26}  icon="mdi:robot-outline" /> }
                           </Avatar>
                           <Stack marginLeft={'10px'}>
                              <Typography fontSize={'14px'} fontWeight={'bold'}>{user || 'ChatBot'}</Typography>
                              <Typography fontSize={'14px'} color={'lightgray'}>{date || '2023-01-01'}</Typography>   
                           </Stack>
                        </Stack>
                        <Typography sx={{marginTop: '10px'}} variant='p'>{text}</Typography>
                        
                        {content ? content : content}
                        {actions ? actions : actions}
                     </Stack>
               </CardContent>
            </Scrollbar>
         </Card>
      </>
   );
}

ChatBubble.propTypes = {
   data: PropTypes.any
 };
 