import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: 'General',
    path: '/',
    icon: icon('ic_user')
  },
  {
    title: 'Smart Shortlist',
    path: '/shortlist',
    icon: icon('ic_analytics')
  },
  {
    title: 'AIHR Chat',
    path: '/chat',
    icon: icon('ic_blog'),
  }
];

export default navConfig;
