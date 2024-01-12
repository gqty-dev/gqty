import type { GraphQLError } from 'graphql';

export type GQtyErrorOptions = {
  graphQLErrors?: GQtyError['graphQLErrors'];
  otherError?: GQtyError['otherError'];
};

export class GQtyError extends Error {
  readonly name = 'GQtyError';

  graphQLErrors?: ReadonlyArray<GraphQLError>;
  otherError?: unknown;

  constructor(
    message: string,
    { graphQLErrors, otherError }: GQtyErrorOptions = {}
  ) {
    super(message);

    if (graphQLErrors) this.graphQLErrors = graphQLErrors;
    if (otherError !== undefined) this.otherError = otherError;
  }

  toJSON() {
    return {
      message: this.message,
      graphQLErrors: this.graphQLErrors,
      otherError: this.otherError,
    };
  }

  static create(error: unknown): GQtyError {
    let newError: GQtyError;

    if (error instanceof GQtyError) {
      newError = error;
    } else if (error instanceof Error) {
      newError = Object.assign(new GQtyError(error.message), error);
    } else {
      newError = new GQtyError('Unexpected error type', {
        otherError: error,
      });
    }

    return newError;
  }

  static fromGraphQLErrors(errors: readonly GraphQLError[]) {
    return new GQtyError(
      (errors.length === 1 && errors[0].message) ||
        (process.env.NODE_ENV === 'production'
          ? `GraphQL Errors`
          : 'GraphQL Errors, please check .graphQLErrors property'),
      { graphQLErrors: errors }
    );
  }
}

export * from './retry';
