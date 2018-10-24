'use strict';

const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools');
const { graphql, printSchema, buildClientSchema } = require('graphql');
const RelayMockNetworkLayerError = require("./RelayMockNetworkLayerError");

module.exports = function getNetworkLayer({schema, mocks, resolvers}) {
    return function fetchQuery(
        operation,
        variableValues
    ) {
        if (typeof schema === 'object' && schema.data) {
            schema = printSchema(buildClientSchema(schema.data));
        }

        const executableSchema = makeExecutableSchema({typeDefs: schema, resolvers});

        // Add mocks, modifies schema in place
        addMockFunctionsToSchema({ schema: executableSchema, mocks });

        return graphql(executableSchema, operation.text, null, null, variableValues).then(
            // Trigger Relay error in case of GraphQL errors (or errors in mutation response)
            // See https://github.com/facebook/relay/issues/1816

            result => {
                if (result.errors && result.errors.length > 0) {
                    return Promise.reject(new RelayMockNetworkLayerError(result.errors));
                }
                return Promise.resolve(result);
            }
        );
    }
};


