'use strict';

const { makeExecutableSchema, addMockFunctionsToSchema } = require('graphql-tools');
const { graphql, printSchema, buildClientSchema } = require('graphql');

module.exports = function getNetworkLayer({schema, mocks}) {
    return function fetchQuery(
        operation,
        variableValues
    ) {
        if (typeof schema === 'object' && schema.data) {
            schema = printSchema(buildClientSchema(schema.data));
        }

        const executableSchema = makeExecutableSchema({typeDefs: schema});

        // Add mocks, modifies schema in place
        addMockFunctionsToSchema({ schema: executableSchema, mocks });

        return graphql(executableSchema, operation.text, null, null, variableValues)
    }
};
