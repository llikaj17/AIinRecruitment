import { Helmet } from 'react-helmet-async';
import { ResumeShortlistView } from '../sections/shortlist/view';

// ----------------------------------------------------------------------

export default function ResumeShortlistPage() {
  return (
    <>
      <Helmet>
        <title> Automated Shortlis </title>
      </Helmet>
      <ResumeShortlistView />
    </>
  );
}
