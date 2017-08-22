# relay-mock-network-layer
Provides a network layer for relay modern that returns schema-correct mock data using `addMockFunctionsToSchema` from [`graphql-tools`](http://dev.apollodata.com/tools/graphql-tools/mocking.html#Default-mock-example);

This is useful for working in an environment like [storybook](https://github.com/storybooks/storybook) where you want to work on your components without hitting a live GraphQL server.

## Usage
```js
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import getNetworkLayer from 'relay-mock-network-layer';
import schema from './graphql.schema.json';

const network = Network.create(getNetworkLayer({
    schema,
    // pass custom mocks as documented in graphql-tools
    // http://dev.apollodata.com/tools/graphql-tools/mocking.html#Customizing-mocks
    mocks: {
        Geography: () => ({
            id: '2',
            countries: [{
                abbreviation: 'US',
                name: 'United States'
            }, {
                abbreviation: 'UK',
                name: 'United Kingdom'
            }],
                usStates: [{
                abbreviation: 'NY',
                name: 'New York'
            }, {
                abbreviation: 'NJ',
                name: 'New Jersey'
            }]
        }),
        Address: () => ({
            country: 'US',
            city: 'New York',
            state: 'NY',
            zipCode: '10012',
        }),
        ...mocks
    }
}));

// Create an environment using this network:
const store = new Store(new RecordSource());
const environment = new Environment({network, store});

// use environment in <QueryRenderer>

```