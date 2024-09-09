import { sample } from 'lodash';
import { faker } from '@faker-js/faker';

// ----------------------------------------------------------------------

export const users = [...Array(24)].map((_, index) => ({
  id: faker.string.uuid(),
  avatarUrl: `/assets/images/avatars/avatar_${index/25 + 1}.jpg`,
  name: faker.person.fullName(),
  company: faker.company.name(),
  age: sample([...new Array(65).keys()]),
  gender: sample(['male', 'female', 'bi', 'other']),
  isVerified: faker.datatype.boolean(),
  status: sample(['selected', 'rejected']),
  role: sample([
    'Leader',
    'Hr Manager',
    'UI Designer',
    'UX Designer',
    'UI/UX Designer',
    'Project Manager',
    'Backend Developer',
    'Full Stack Designer',
    'Front End Developer',
    'Full Stack Developer',
  ]),
}));
