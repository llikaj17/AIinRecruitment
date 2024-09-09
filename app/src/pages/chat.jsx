import { Helmet } from 'react-helmet-async';
import { ChatWithHR } from '../sections/chat';

// ----------------------------------------------------------------------

export default function ResumeShortlistPage() {
  return (
    <>
      <Helmet>
        <title> AI HR Assistant </title>
      </Helmet>
      <ChatWithHR />
    </>
  );
}
