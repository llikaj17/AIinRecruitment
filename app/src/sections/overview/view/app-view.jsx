import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import AppCurrentVisits from '../app-current-visits';
import AppWidgetSummary from '../app-widget-summary';
import AppConversionRates from '../app-conversion-rates';
import axios from 'axios';
import { UserView } from '../../user/view';
import JobsList from '../../jobs/view/jobs-list';
import { useStore } from '/src/routes/hooks';
import { Button } from '@mui/material';

// ----------------------------------------------------------------------

export default function AppView() {

  const configureResumes = useStore((state) => state.addResumes);
  const [users, setUsers] = useState([]);
  const [age, setAge] = useState({});
  const [gender, setGender] = useState({});
  const [nationalities, setNationalities] = useState({});
  const [countNations, setCountNations] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/content/resumes')
      .then(response => {
        const entries = Object.entries(response.data).map(entry => entry[1].content);
        console.log(entries);
        setUsers(entries);
        configureResumes(entries);
        handleAgeDistribution(entries);
        handleGenderDistribution(entries);
        handleNationalityDistribution(entries);
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const handleAgeDistribution = (users) => {
    const ages = {};
    users.forEach(user => {
      ages[user.personal.Age] = (ages[user.personal.Age] ?? 0) + 1
    });
    setAge(ages);
  }

  const handleGenderDistribution = (users) => {
    const gender = {};
    users.forEach(user => {
      gender[user.personal.Gender] = (gender[user.personal.Gender] ?? 0) + 1
    });
    setGender(gender);
  }

  const handleNationalityDistribution = (users) => {
    const nations = {};
    users.forEach(user => {
      nations[user.personal.Nationality] = (nations[user.personal.Nationality] ?? 0) + 1
    });
    setNationalities(nations);
    setCountNations(Object.keys(nations).length);
  }

  const handleReindexChromaDB = async () => {
    setIsLoading(true);
    await axios.post('http://localhost:3000/api/v1/vectordb/embeddings');
    setIsLoading(false);
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h1" sx={{ mb: 5 }}>
        AI Recruiting
        <Button sx={{position: 'absolute', right: '5%', top: '12%'}} variant='contained' onClick={() => handleReindexChromaDB()}>Reindex ChromaDB</Button>
      </Typography>
      {isLoading ? <p>Reindex in prograss...This might take a while! Please, sit back and relax!</p> : <>Chroma DB Loaded</>}
      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Applications"
            total={users.length}
            color="success"
            icon={<img alt="icon" src="/assets/icons/glass/users-svgrepo-com.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4}>
          <AppWidgetSummary
            title="Jobs"
            total={10}
            color="info"
            icon={<img alt="icon" src="/assets/icons/glass/list-1-svgrepo-com.svg" />}
          />
        </Grid>

        <Grid xs={12} sm={6} md={4} mb={5}>
          <AppWidgetSummary
            title="Nationalities"
            total={countNations}
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/flag-2-svgrepo-com.svg" />}
          />
        </Grid>

        <UserView users={users} />

        <Grid xs={12} md={6} lg={4} mt={2}>
          <AppCurrentVisits
            title="Gender Data Distribution"
            chart={{
              series: Object.entries(gender).map(([key, val]) => {
                return { label: key, value: val }
              })
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} mt={2}>
          <AppConversionRates
            title="Age Data Distribution"
            chart={{
              series: Object.entries(age).map(([key, val]) => {
                return { label: key, value: val }
              })
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4} mt={2}>
          <AppCurrentVisits
            title="Nationalities"
            chart={{
              series: Object.entries(nationalities).map(([key, val]) => {
                return { label: key, value: val }
              })
            }}
          />
        </Grid>
        <JobsList />
      </Grid>
    </Container>
  );
}
