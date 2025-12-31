// apollo.js
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const httpLink = new HttpLink({
  // uri: 'https://lm-backend-zrtl.onrender.com/graphql', // ✅ Ensure /graphql
  uri: 'http://192.168.1.8:4000/graphql',

});

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

const client = new ApolloClient({
  link: authLink.concat(httpLink),
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
