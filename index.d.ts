import { FetchFunction } from 'relay-runtime';
import { IExecutableSchemaDefinition, IMocks } from 'graphql-tools';

interface Props extends Omit<IExecutableSchemaDefinition, 'typeDefs'> {
    schema: { data: any } | string;
    mocks?: IMocks;
    resolveQueryFromOperation?: boolean;
    preserveResolvers?: boolean;
}

export default function getNetworkLayer(props: Props): FetchFunction;
