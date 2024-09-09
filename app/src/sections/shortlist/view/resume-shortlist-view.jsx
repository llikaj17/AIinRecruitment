import { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import Iconify from 'src/components/iconify';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import axios from 'axios';
import { faker } from '@faker-js/faker';
import Scrollbar from 'src/components/scrollbar';
import JobModal from '/src/components/modals/jobModal';
import ApplicantModal from '/src/components/modals/applicantModal';
import Survey from '/src/components/survey/survey';
import { useStore } from '/src/routes/hooks';

// ----------------------------------------------------------------------

export default function ResumeShortlist() {
  const [applicants, setApplicants] = useState([]);
  const [shortlistNumber, setShortlistNumber] = useState(3);
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPropmt] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showPassword, setShowPassword] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const [botResult, setBotResult] = useState({});
  const [jobs, setJobs] = useState([]);
  const [openJobModal, setOpenJobModal] = useState(false);
  const [applicantModalContent, setApplicantModalContent] = useState({});
  const [jobModalContent, sebJobModalContent] = useState({});
  const [openApplicantModal, setOpenApplicantModal] = useState(false);
  const [openSurvey, setOpenSurvey] = useState(false);
  const [surveyJob, setSurveyJob] = useState(null);

  const configureResumes = useStore((state) => state.addResumes);
  const configureJobs = useStore((state) => state.addJobs);

  const shortlistCandidate = useStore((state) => state.shortlistCandidate);

  const configuredModels = {
    'GPT 3.5': 'gpt-3.5-turbo',
    'GPT 4': 'gpt-4',
    'GPT 4o': 'gpt-4o',
    'GPT 4o-mini': 'gpt-4o-mini'
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const closeOpenJobModal = () => setOpenJobModal(false);

  const handleViewJobDetails = (jobIndex) => {
    setOpenJobModal(true);
    sebJobModalContent(jobs[jobIndex]);
  }

  const handleViewApplicantDetails = (content) => {
    setApplicantModalContent(content);
    setOpenApplicantModal(true);
  }

  const closeOpenApplicantModal = () => {
    setOpenApplicantModal(false);
  }

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const columns = [
    { id: 'name', label: 'Name', minWidth: 100 },
    { id: 'score', label: 'Score', minWidth: 100 },
    { id: 'Age', label: 'Age', minWidth: 100 },
    { id: 'Gender', label: 'Gender', minWidth: 100 },
    { id: 'Nationality', label: 'Nationality', minWidth: 100 },
    { id: 'actions', label: '', minWidth: 100 }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  useEffect(() => {
    const shortlisting = async () => {
      const jobTitles = [];
      const jobsData = await axios.get('http://localhost:3000/api/v1/content/jobs');
      const jobEntries = Object.entries(jobsData.data).map(entry => entry[1]);
      jobEntries.forEach(job => {
        jobTitles.push(job?.content.title ?? '');
      })
      setJobs(jobEntries);
      configureJobs(jobEntries);

      const resumesData = await axios.get('http://localhost:3000/api/v1/content/resumes');
      const resumes = Object.entries(resumesData.data).map(entry => entry[1]);
      configureResumes(resumes);

      const applications = {};
      resumes.forEach(candidate => {
        const matchingJob = jobTitles.find(title => title.includes(candidate.content.role));
        if (matchingJob) {
          candidate.content.score = 'n/a';
          !applications[matchingJob] ? applications[matchingJob] = [candidate] : applications[matchingJob].push(candidate)
        }
      });
      setApplicants(applications);
      setOpenApplicantModal(false);
    }

    shortlisting();
  }, []);

  const handleResumeShortlist = async (jobIndex) => {
    setLoading(true);
    const response = await axios.post(
      'http://localhost:3000/api/v1/vectordb/search',
      {
        jobDesciption: jobs[jobIndex].description ?? ''
      }
    );

    const result = Object.entries(response.data).map(entry => entry[1])[0];
    const botResponse = botResult;
    botResponse[jobIndex.toString()] = result;
    extractCandidateScore(jobs[jobIndex].content.title ?? jobs[jobIndex].job, result);
    console.log('Response: ', botResponse);
    setBotResult(botResponse);
    setLoading(false);
  }

  const handleOpenSurvey = (jobIndex) => {
    setSurveyJob(jobs[jobIndex]);
    setOpenSurvey(true);
  }

  const parseBotResponse = (botResponse) => {
    return botResponse.replaceAll('\n', '').replaceAll('   ', ' ').replaceAll('\t', ' ').trim();
  }

  const extractCandidateScore = (jobTitle, botResponse) => {
    const regex = /(\d+\.\s)([\w\s]+) - Score: ([0-9.]+)/g;

    let match;
    const candidates = [];
    const parseResponse = parseBotResponse(botResponse);
    console.log('Response: ', parseResponse);

    // A way to match the scores. Not appropriate because it depends how AI responds :)
    while (
      (match = regex.exec(parseResponse.replaceAll('\n', ''))) !== null && candidates.length <= shortlistNumber) {
      candidates.push({ name: match[2], score: parseFloat(match[3]) });
    }

    console.log('Candidates: ', candidates);
    const applications = applicants;

    applications[jobTitle].map(applicant => {
      const candidateName = applicant.content.name;
      if (!candidates.length) {
        // Another fallback TODO: Fix me
        return applicant;
      }
      const shortlisted = candidates.find(candidate => candidate.name.includes(candidateName));
      if (!shortlisted) {
        applicant.content.status = 'disabled';
        return applicant;
      }
      applicant.content.score = shortlisted.score;
      return applicant;
    });

    applications[jobTitle] = applications[jobTitle].sort((a, b) => (
      a.content.score < b.content.score ? 1 : b.content.score > a.content.score ? -1 : 0));

    console.log('Shortlisting Ranking: Applicant = ', applicants);
    console.log('Shortlisting Ranking: Applications = ', applications);

    setApplicants(applications);
    const shortlisted = applications[jobTitle].filter(applicant => applicant.content.status !== 'disabled');
    shortlistCandidate(shortlisted);
  }

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5} mt={5}>
        <Typography variant="h2">Automated Resume Shortlist</Typography>
      </Stack>
      <Stack width={'100%'} mb={4}>
        <Typography variant="h5" sx={{ display: 'flex', alignContent: 'center', alignItems: 'center' }}><Iconify sx={{ marginRight: '10px' }} width={40} icon="solar:settings-broken" />Configs</Typography>
        <Stack direction={'row'} alignItems={'center'} mt={2} mb={1}>
          <FormControl sx={{ mr: 3, width: '80ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-password">OpenAI API Key</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              type={showPassword ? 'text' : 'password'}
              label="OpenAI API Key"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <Iconify icon="iconamoon:eye-off-light" /> : <Iconify icon="mdi:eye-outline" />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <TextField
            id="outlined-number"
            label="Shortlist Number"
            disabled
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            defaultValue={3}
          />
          <FormControl sx={{ mt: 3, ml: 2, minWidth: 260 }}>
            <InputLabel id="select-model">Model</InputLabel>
            <Select
              labelId="select-model-label"
              id="select-model"
              value={model}
              label="Model"
              onChange={(event) => setModel(event.target.value)}
            >
              {Object.entries(configuredModels).map(([key, value]) =>
                (<MenuItem key={key} value={value}>{key}</MenuItem>)
              )}
            </Select>
            <FormHelperText>Select model (Change context size)</FormHelperText>
          </FormControl>
        </Stack>
        <FormControlLabel control={<Checkbox label='Custom Prompt' onChange={() => setCustomPropmt(!customPrompt)} />} label="Custom Prompt" />
        {customPrompt ?
          <Card><CardContent><TextField
            id="standard-multiline-static"
            label="Custom Prompt Template"
            multiline
            rows={4}
            variant="standard"
            placeholder='Please Use {} for user placeholders inputs/configured data. e.g. Answer the {question}.'
            sx={{ minWidth: '100%' }}
          /></CardContent></Card> : <></>}
      </Stack>

      {Object.entries(applicants).map(([key, value], index) => (
        <Accordion disabled={loading} sx={{marginBottom: '40px'}} expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)} key={faker.string.uuid()}>
          <AccordionSummary
            expandIcon={<Iconify icon="lets-icons:expand-down" />}
            aria-controls={`panel${index}bh-content`}
            id={`panel${index}bh-header`}
          >
            <Typography sx={{ width: '70%', height: '40px', justifyContent: 'space-between', alignContent: 'center' }}>
              {key.replace('1. ', '')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {loading &&
              <Box sx={{ height: '100%', position: 'absolute', left: '0%', top: '0%', bgcolor: 'gray', width: '100%', zIndex: 10, opacity: '50%', borderRadius: '20px' }}>
                <Fade
                  in={loading}
                  style={{
                    transitionDelay: loading ? '800ms' : '0ms',
                  }}
                  unmountOnExit
                >
                  <CircularProgress sx={{ position: 'absolute', top: '50%', left: '50%', opacity: '50%' }} />
                </Fade>
              </Box>
            }
            <Stack style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction={'row'} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} spacing={2} >
                <Button onClick={() => handleViewJobDetails(index)} key={faker.string.uuid()} variant="contained" color="inherit" startIcon={<Iconify icon="ep:list" />} style={{ marginBottom: '20px' }}>
                  Job Details
                </Button>
                <Button onClick={() => handleResumeShortlist(index)} key={faker.string.uuid()} variant="contained" color="inherit" startIcon={<Iconify icon="icon-park-outline:safe-retrieval" />} style={{ marginBottom: '20px' }}>
                  {loading ? 'Loading...' : 'Automated Shortlist'}
                </Button>
                {botResult[index] && <Button onClick={() => handleOpenSurvey(index)} key={faker.string.uuid()} variant="contained" color="inherit" startIcon={<Iconify icon="ep:list" />} style={{ marginBottom: '20px' }}>
                  Take Survey
                </Button>}
              </Stack>

              <Typography sx={{ color: 'lightgray' }}>Shortlisted candidate will be colored.</Typography>
            </Stack>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          style={{ minWidth: column.minWidth }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {value
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((row) => {
                        return (
                          <TableRow hover role="checkbox" tabIndex={-1} key={faker.string.uuid()} sx={{ bgcolor: row.content.status === 'disabled' ? 'lightgray' : '' }}>
                            {columns.map((column) => {
                              const value = row.content[column.id] ?? row.content.personal[column.id] ??
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => handleViewApplicantDetails(row.content)}
                                  edge="end"
                                >
                                  <Iconify icon="mdi:eye-outline" />
                                </IconButton>;
                              return (
                                <TableCell key={faker.string.uuid()} align={column.align}>
                                  {column.format && typeof value === 'number'
                                    ? column.format(value)
                                    : value}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={value.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
            <Card>
              <Scrollbar>
                <CardContent sx={{ height: '150px', bgcolor: '#0001', overflowY: 'scroll' }}>
                  <Typography sx={{ alignContent: 'center', display: 'flex' }}><Iconify sx={{ marginRight: '10px' }} width={25} icon="hugeicons:bot" />
                    <b>Response from Bot</b>
                  </Typography>
                  <Typography sx={{ mt: '10px' }}>Explainability: Here is displayed AI Generated Result</Typography>
                  <Typography>{botResult[index] ?? ''}</Typography>
                </CardContent>
              </Scrollbar>
            </Card>
          </AccordionDetails>
          {openJobModal ? <JobModal job={jobModalContent} open={openJobModal} onCloseModal={closeOpenJobModal} /> : <></>}
        </Accordion>
      ))}
      {openApplicantModal ? <ApplicantModal applicant={applicantModalContent} open={openApplicantModal} onCloseModal={closeOpenApplicantModal} /> : <></>}
      {openSurvey && <Survey openSurvey={openSurvey} closeSurvey={() => setOpenSurvey(false)} job={surveyJob} />}
    </Container>
  );
}
