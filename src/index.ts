import {
    makeExecutableSchema,
    addMockFunctionsToSchema,
    IExecutableSchemaDefinition,
    IMocks,
} from 'graphql-tools';
import { FetchFunction, RequestParameters } from 'relay-runtime';
import { graphql, printSchema, buildClientSchema } from 'graphql';
import RelayMockNetworkLayerError from './RelayMockNetworkLayerError';

const defaultSchemaDefinitionOptions = {
    resolverValidationOptions: {
        // Silence error regarding missing Relay `Node` type
        // https://github.com/este/este/issues/1513#issuecomment-385752066
        requireResolversForResolveType: false,
    },
};

interface Config extends Omit<IExecutableSchemaDefinition, 'typeDefs'> {
    schema: { data: any } | string;
    mocks?: IMocks;
    resolveQueryFromOperation?: (operation: RequestParameters) => string;
    preserveResolvers?: boolean;
}

/**
 * @param {Object} networkConfig - The configuration for the mock network layer.
 * @param {(string|Object)} networkConfig.schema - If string, the graphql schema SDL. If object, the JSON introspection query.
 * @param {Object} networkConfig.mocks - Mock primative resolvers, passed directly to addMockFunctionsToSchema.
 * @param {Object} networkConfig.resolvers - Default resolvers for a schema.
 * @param {Function} [networkConfig.resolveQueryFromOperation] - If relay operation query text does not exist, used to resolve the query from the operation. Useful for persisted query support.
 */
export default function getNetworkLayer({
    schema,
    mocks,
    resolvers,
    resolveQueryFromOperation,

    /** https://www.apollographql.com/docs/graphql-tools/mocking.html#Mocking-interfaces */
    preserveResolvers = false,

    /**
     * https://github.com/apollographql/graphql-tools/blob/master/src/Interfaces.ts#L125
     * @type IExecutableSchemaDefinition
     */
    ...schemaDefinitionOptions
}: Config): FetchFunction {
    schemaDefinitionOptions = {
        ...defaultSchemaDefinitionOptions,
        ...schemaDefinitionOptions,
    };

    if (typeof schema === 'object' && schema.data) {
        schema = printSchema(buildClientSchema(schema.data));
    }

    const executableSchema = makeExecutableSchema({
        // @ts-ignore
        typeDefs: schema,
        resolvers,
        ...schemaDefinitionOptions,
    });

    // Add mocks, modifies schema in place
    addMockFunctionsToSchema({ schema: executableSchema, mocks, preserveResolvers });

    return async function fetchQuery(request, variables) {
        const query = resolveQueryFromOperation?.(request) || request.text;

        if (!query) {
            throw new Error(
                'Could not find query, ensure operation.text exists or pass resolveQueryFromOperation.'
            );
        }


        const {errors, data} = await graphql(executableSchema, query, null, null, variables);

        // Trigger Relay error in case of GraphQL errors (or errors in mutation response)
        // See https://github.com/facebook/relay/issues/1816
        if (errors && errors.length > 0) {
            throw new RelayMockNetworkLayerError(errors);
        }

        return {data}
    };
}
