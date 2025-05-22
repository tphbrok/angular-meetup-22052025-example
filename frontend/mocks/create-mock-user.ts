import { faker } from '@faker-js/faker';
import { paths } from '../src/api-schema';

faker.seed(1);

export function createMockUser(): paths['/users/{id}']['get']['responses']['200']['content']['application/json'] {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
  };
}

export const mockUsers = Array(20).fill(1).map(createMockUser);
