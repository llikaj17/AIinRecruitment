import PropTypes from 'prop-types';
import { 
   Avatar, 
   Card, 
   Typography,
   Stack
} from "@mui/material";
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------


export const ChatError = (type) => {
  return (
    <>
      <Card>
         <Stack>
            <Typography>{type}</Typography>
         </Stack>
      </Card>
    </>
  );
}

ChatError.propTypes = {
   type: PropTypes.string
 };
 