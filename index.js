'use strict';

const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools');
const { graphql, printSchema, buildClientSchema } = require('graphql');
const RelayMockNetworkLayerError = require('./RelayMockNetworkLayerError');

/**
 * @param {Object} networkConfig - The configuration for the mock network layer.
 * @param {(string|Object)} networkConfig.schema - If string, the graphql schema SDL. If object, the JSON introspection query.
 * @param {Object} networkConfig.mocks - Mock primative resolvers, passed directly to addMockFunctionsToSchema.
 * @param {Object} networkConfig.resolvers - Default resolvers for a schema.
 * @param {Object} [networkConfig.resolveQueryFromOperation] - If relay operation query text does not exist, used to resolve the query from the operation. Useful for persisted query support.
 */
function getNetworkLayer({ schema, mocks, resolvers, resolveQueryFromOperation }) {
    return function fetchQuery(operation, variableValues) {
        if (typeof schema === 'object' && schema.data) {
            schema = printSchema(buildClientSchema(schema.data));
        }

        const executableSchema = makeExecutableSchema({ typeDefs: schema, resolvers });

        // Add mocks, modifies schema in place
        addMockFunctionsToSchema({ schema: executableSchema, mocks });

        const query =
            (resolveQueryFromOperation && resolveQueryFromOperation(operation)) || operation.text;

        if (!query) {
            throw new Error(
                'Could not find query, ensure operation.text exists or pass resolveQueryFromOperation.'
            );
        }

        return graphql(executableSchema, query, null, null, variableValues).then(
            // Trigger Relay error in case of GraphQL errors (or errors in mutation response)
            // See https://github.com/facebook/relay/issues/1816

            result => {
                if (result.errors && result.errors.length > 0) {
                    return Promise.reject(new RelayMockNetworkLayerError(result.errors));
                }
                return Promise.resolve(result);
            }
        );
    };
}

module.exports = getNetworkLayer;
