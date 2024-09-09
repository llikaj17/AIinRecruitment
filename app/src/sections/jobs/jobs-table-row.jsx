import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';
import PropTypes from 'prop-types';
import { Badge, Button } from '@mui/material';

// ----------------------------------------------------------------------

export default function JobsTableRow({
  selected,
  title,
  description,
  handleClick,
}) {
  const handleShowMore = () => {
    // setOpen(null);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none" width="220px">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="subtitle2">
              {title.replace('1. ', '')}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{description.substring(0, 200)}...</TableCell>

        <TableCell align="left">
          <Stack direction={'row'} spacing={'0'} justifyContent={'space-between'} alignItems={'center'}>
            <Button>View</Button>
          </Stack>
        </TableCell>
      </TableRow>
    </>
  );
}

JobsTableRow.propTypes = {
  selected: PropTypes.any,
  title: PropTypes.string,
  description: PropTypes.string,
  handleClick: PropTypes.func
};
