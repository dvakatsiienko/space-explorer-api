/* Core */
import { ApolloServer } from 'apollo-server';
import { join } from 'path';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import isEmail from 'isemail';
import dotenv from 'dotenv';
import type { DocumentNode } from 'graphql';

/* Instruments */
import { resolvers } from './resolvers';
import { LaunchAPI, UserAPI } from './datasources';

dotenv.config({ path: '.env.development.local' });

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
}) as unknown as DocumentNode;

const apolloServer = new ApolloServer({
    resolvers,
    typeDefs: schema,
    context: async expressCtx => {
        const { req } = expressCtx;

        const auth = req.headers?.authorization ?? '';
        const userEmail = Buffer.from(auth, 'base64').toString('ascii');

        return { userEmail: isEmail.validate(userEmail) ? userEmail : null };
    },
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI(),
    }),
});

const PORT = process.env.PORT;

apolloServer.listen({ port: PORT }).then(data => {
    console.log(PORT);
    console.log(data);
    console.log(
        `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
    console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
});
