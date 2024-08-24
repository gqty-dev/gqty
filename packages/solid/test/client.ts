import { createMockClient, type MockClientOptions } from 'test-utils';
import { createSolidClient, type SolidClientOptions } from '../src';

export type TestClientOptions = {
  solid?: SolidClientOptions;
  client?: MockClientOptions;
};

export const createMockSolidClient = async (options?: TestClientOptions) => {
  const client = await createMockClient(options?.client);

  return createSolidClient(client, options?.solid);
};
