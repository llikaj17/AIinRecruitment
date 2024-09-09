import { useEffect, useRef } from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import Iconify from 'src/components/iconify';
import { faker } from '@faker-js/faker';
import Scrollbar from 'src/components/scrollbar';
import { ChatSearch } from './chat-search';
import { ChatBubble } from './chat-bubble';
import { useStore } from 'src/routes/hooks';
import { ChatInitialMessage } from './chat-initial-message';
import { ChatConfigsMessage } from './chat-configs-message';


// ----------------------------------------------------------------------

export default function ChatWithHR() {
  const lastElementRef = useRef();

  const messages = useStore((state) => state.messages);
  const addUserMessage = useStore((state) => state.addUserMessage);
  const addBotMessage = useStore((state) => state.addSystemMessage);
  const removeMessage = useStore((state) => state.removeLastMessage);
  const sessionId = `chat_${faker.string.uuid()}`;

  useEffect(() => {

  }, []);

  const scrollLastElement = () => {
    console.log('Scroll: ', lastElementRef.current)
    if (lastElementRef.current) {
      lastElementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }

  const parseBotResponse = (botResponse) => {
    return botResponse.replaceAll('\n', '').replaceAll('   ', ' ').replaceAll('\t', ' ').trim();
  }

  const exportChat = () => {
    if (!messages.length) {
      alert('There are no messages between the system and the user. Type something first.');
      return;
    }
    // mlimper at https://stackoverflow.com/questions/19721439/download-json-object-as-a-file-from-browser
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(messages));
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "chat.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

  const importChat = () => {
    alert('Functionality is not implement yet. It should allow users to restore the messages and configurations. We are working on it...');
  }

  return (
    <Container sx={{height: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: '-88px'}}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={2}>
        <Typography variant="h2">Smart AIHRecruit</Typography>
        <Stack spacing={3} direction={'row'}>
          <Button 
            variant='contained'
            sx={{
              padding: '10px', 
              fontSize: '16px', 
              display: 'flex', 
              justifyContent: 
              'space-between', 
              alignItems: 'center', 
              bgcolor: '#000c14'
            }}
            onClick={() => exportChat()}>
            <Iconify width={26} sx={{marginBottom: '5px', marginRight: '5px'}} icon="ph:export-bold" /> Export Chat
          </Button>
          <Button 
            variant='contained'
            sx={{
              padding: '10px', 
              fontSize: '16px', 
              display: 'flex', 
              justifyContent: 
              'space-between', 
              alignItems: 'center', 
              bgcolor: '#000c14'
            }}
            onClick={() => importChat()}>
            <Iconify width={26} sx={{marginBottom: '5px', marginRight: '5px'}} icon="uil:import" /> Import Chat
          </Button>
        </Stack>
        
        
      </Stack>
      <Stack sx={{height: '100%', overflow: 'hidden', display: 'flex', justifyContent: 'space-between'}}>
        <Scrollbar sx={{height: '82vh'}}>
          <ChatInitialMessage />
          <ChatConfigsMessage />
          {messages.map((message, index) => (
              <ChatBubble key={faker.string.uuid()} data={{user: message.referer, text: message.message}}/>
          ))}
          <Typography id={'scrollIntoMe'} ref={lastElementRef}></Typography>
        </Scrollbar>
        <ChatSearch onUserInput={addUserMessage} onBotResponse={addBotMessage} removeLoadingMessage={removeMessage} scrollIntoView={scrollLastElement} sessionId={sessionId} />
      </Stack>
    </Container>
  );
}
