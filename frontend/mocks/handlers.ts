import { createMockUser, mockUsers } from './create-mock-user';
import { paths } from '../src/api-schema';
import { createOpenApiHttp } from 'openapi-msw';
import { delay, graphql, HttpResponse } from 'msw';
import { UsersDocument, UsersQuery } from '../graphql/generated';

const http = createOpenApiHttp<paths>();

export const handlers = [
  // Simulate a realistic server delay
  http.untyped.all('*', async () => {
    await delay();
  }),

  http.get('/users', ({ response }) => {
    return response(200).json(mockUsers);
  }),

  http.post('/users', async ({ request, response }) => {
    const newUser = await request.json();

    // I do not want to be impersonated
    if (newUser.name === 'Thomas Brok') {
      return response(400);
    }

    mockUsers.push(newUser);

    return response(201).json(newUser);
  }),

  http.get('/users/{id}', ({ params, response }) => {
    const user = mockUsers.find((user) => user.id === params.id);

    if (!user) {
      return response(404);
    }

    return response(200).json(user);
  }),

  http.put('/users/{id}', async ({ params, request, response }) => {
    const user = mockUsers.find((user) => user.id === params.id);

    if (!user) {
      return response(404);
    }

    const updatedUserData = await request.json();

    // I do not want to be impersonated
    if (updatedUserData.name === 'Thomas Brok') {
      return response(400);
    }

    user.name = updatedUserData.name;
    user.email = updatedUserData.email;

    return response(200).json(user);
  }),

  http.delete('/users/{id}', ({ params, response }) => {
    const userIndex = mockUsers.findIndex((user) => user.id === params.id);

    if (userIndex === -1) {
      return response(404);
    }

    mockUsers.splice(userIndex, 1);

    return response(200).json({ id: params.id });
  }),

  http.untyped.get('https://api.some-other-company.com/users', async () => {
    // Fail sometimes, like the real API
    if (Math.random() > 0.8) {
      return HttpResponse.json(
        { error: 'A server error occured' },
        { status: 500 }
      );
    }

    // Take 10 seconds to reply sometimes, like the real API
    if (Math.random() > 0.8) {
      await delay(10000);
    }

    return HttpResponse.json(Array(100).fill(1).map(createMockUser));
  }),

  graphql.query<UsersQuery>(UsersDocument, () => {
    return HttpResponse.json({
      data: { getUsers: Array(10).fill(1).map(createMockUser) },
    });
  }),
];
