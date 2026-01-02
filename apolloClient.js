import { ApolloClient, InMemoryCache, HttpLink, split, ApolloLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

// 1. HTTP Link for Queries & Mutations
const httpLink = new HttpLink({
  // uri: 'https://lm-backend-zrtl.onrender.com/graphql', // ✅ Ensure /graphql
  uri: 'http://192.168.1.8:4000/graphql',
});

// 2. WebSocket Link for Subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    //url: 'wss://lm-backend-zrtl.onrender.com/graphql',
    url: 'ws://192.168.1.8:4000/graphql',
    connectionParams: async () => {
      // Get your token from storage (e.g., AsyncStorage / localStorage)
      const token = await AsyncStorage.getItem('token');
      return {
        Authorization: token ? `Bearer ${token}` : '',
      };
    },
    shouldRetry: () => true, // Auto-reconnect logic
    on: {
      connected: () => console.log('✅ GraphQL WebSocket Connected'),
      error: (error) => console.error('❌ GraphQL WebSocket Error:', error),
      closed: (event) => console.log('⚠️ GraphQL WebSocket Closed:', event),
      message: (message) => console.log('📩 GraphQL WebSocket Message:', message),
    },
  })
);

// 3. Auth Link for HTTP (Queries & Mutations)
const authLink = new ApolloLink((operation, forward) => {
  return AsyncStorage.getItem('token').then((token) => {
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    });
    return forward(operation);
  });
});

// 4. Split the traffic
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// 5. Initialize Client
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    canonizeResults: false,
  }),
  defaultOptions: {
    watchQuery: {
      canonizeResults: false,
    },
    query: {
      canonizeResults: false,
    },
  },
});

export default client;

