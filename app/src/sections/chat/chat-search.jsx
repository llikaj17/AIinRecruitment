import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import Iconify from 'src/components/iconify';
import axios from 'axios';
import { FormHelperText } from '@mui/material';
import PropTypes from 'prop-types';
import { useStore } from '/src/routes/hooks';

// ----------------------------------------------------------------------

export const ChatSearch = ({ onUserInput, onBotResponse, removeLoadingMessage, scrollIntoView, sessionId }) => {
   const [value, updateVal] = React.useState('');
   const configs = useStore((state) => state.chatConfigurations);

   const handleUserInput = async (message) => {
      const response = await axios.post(
         'http://localhost:3000/api/v1/chat/', {
            message: message,
            sessionId: sessionId,
            ...configs
      }
      );
      console.log(response.data);
      removeLoadingMessage();
      return Object.keys(response.data).length && response.data.data ? response.data.data : 'Internal Error on the server. Please check logs';
   }

   const handleClickSendMessage = async () => {
      if (!value.length) {
         return;
      }
      onUserInput(value);
      handleClickDeleteInput();
      onBotResponse('Loading...');3
      const aiMessage = await handleUserInput(value);
      onBotResponse(aiMessage);
      scrollIntoView();
   }

   const handleClickDeleteInput = () => updateVal('');

   const handleMouseDownChat = (event) => {
      event.preventDefault();
   };

   const onChange = (e) => {
      updateVal(e.target.value);
   };

   const handleKeyPress = (e) => {
      if (e.keyCode === 13) {
         handleClickSendMessage();
      }
   }

   return (
      <>
         <FormControl sx={{ width: '100%', marginTop: '40px' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-chat-search">
               {configs.assistantMode === 'resume' ? 'Ask me about the uploaded resume' : configs.assistantMode === 'job' ? 'Ask question about relevant candiadates for the configured job description' : 'Send your prompts...'}
            </InputLabel>
            <OutlinedInput
               id="outlined-adornment-chat-search"
               type={'text'}
               onChange={onChange}
               onKeyDown={handleKeyPress}
               disabled={Object.keys(configs).length === 0}
               value={value}
               label={configs.assistantMode === 'resume' ? 'Ask me about the uploaded resume' : configs.assistantMode === 'job' ? 'Ask question about relevant candiadates for the configured job description' : 'Send your prompts...'}
               endAdornment={
                  <InputAdornment position="end">
                     <IconButton
                        aria-label="delete the message from the input"
                        onClick={handleClickDeleteInput}
                        onMouseDown={handleMouseDownChat}
                        edge="end"
                        sx={{ marginRight: '0' }}
                     >
                        <Iconify icon="solar:send-square-outline" />
                     </IconButton>
                     <IconButton
                        aria-label="send a message to chat"
                        onClick={handleClickSendMessage}
                        onMouseDown={handleMouseDownChat}
                        edge="end"
                     >
                        <Iconify icon="akar-icons:send" />
                     </IconButton>
                  </InputAdornment>
               }
            />
            {Object.keys(configs).length === 0 ? <FormHelperText>Chat is disabled. Please check your bot settings!</FormHelperText> : <></>}
         </FormControl>
      </>
   );
}

ChatSearch.propTypes = {
   onUserInput: PropTypes.func, 
   onBotResponse: PropTypes.func,
   removeLoadingMessage: PropTypes.func,
   scrollIntoView: PropTypes.func,
   sessionId: PropTypes.any
};
 