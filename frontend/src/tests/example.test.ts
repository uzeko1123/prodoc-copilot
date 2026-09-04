import { expect, test } from 'vitest';

interface User {
  name: string;
  age: number;
}

function createUser(name: string, age: number): User {
  return { name, age };
}

test('creates a user with the correct fields', () => {
  const user = createUser('Alice', 30);

  expect(user).toEqual({ name: 'Alice', age: 30 });
  expect(user.name).toBe('Alice');
});
