import { GraphQLError } from 'graphql';

export default class RelayMockNetworkLayerError extends Error {
    public originalErrors: readonly GraphQLError[];

    constructor(errors: readonly GraphQLError[]) {
        const distinctMessages = errors
            .map(e => e.message)
            .filter((value, index, messages) => messages.indexOf(value) === index);
        super('RelayMockNetworkLayerError: ' + distinctMessages.join(' - '));
        this.originalErrors = errors;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
