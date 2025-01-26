import { GraphQLError, type ExecutionResult } from 'graphql';
import { GQtyError } from '../Error';

export const defaultResponseHandler = async (response: Response) => {
  const result = await parseResponse(response);

  assertExecutionResult(result);

  handleResponseErrors(result);

  return result;
};

export const parseResponse = async (response: Response) => {
  const text = await response.text().then((text) => text.trim() || null);

  if (response.status >= 400) {
    throw new GQtyError(
      `Received HTTP ${response.status} from GraphQL endpoint${
        text
          ? `, body: ${text.length > 50 ? text.slice(0, 50) + '...' : text}`
          : ''
      }.`
    );
  }

  if (!text) {
    throw new GQtyError('Received an empty response from GraphQL endpoint.');
  }

  try {
    const result = JSON.parse(text);

    if (Array.isArray(result?.errors)) {
      result.errors = result.errors.map(
        (error: any) => new GraphQLError(error.message, error)
      );
    }

    return result;
  } catch {
    throw new GQtyError(
      `Received malformed JSON response from GraphQL endpoint: ${
        text.length > 50 ? text.slice(0, 50) + '...' : text
      }`
    );
  }
};

export function assertExecutionResult(
  input: unknown
): asserts input is ExecutionResult {
  if (!isExecutionResult(input)) {
    throw new GQtyError(
      `Expected response to be an ExecutionResult, received: ${JSON.stringify(
        input
      )}`
    );
  }
}

export const isExecutionResult = (input: unknown): input is ExecutionResult => {
  if (typeof input !== 'object' || input === null) return false;

  const value = input as Record<string, unknown>;

  return (
    'data' in value ||
    (Array.isArray(value.errors) &&
      value.errors.every((error) => error instanceof GraphQLError))
  );
};

export const handleResponseErrors = (result: ExecutionResult) => {
  if (result.errors?.length) {
    throw GQtyError.fromGraphQLErrors(result.errors);
  }
};
