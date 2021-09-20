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
import { createStore } from './utils';
import { LaunchAPI, UserAPI } from './datasources';

dotenv.config();

const store = createStore();

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
}) as unknown as DocumentNode;

const apolloServer = new ApolloServer({
    resolvers,
    typeDefs: schema,
    context: async expressCtx => {
        const { req } = expressCtx;

        const auth = req.headers?.authorization ?? '';
        const email = Buffer.from(auth, 'base64').toString('ascii');

        if (!isEmail.validate(email)) return { user: null };

        const [foundUser] = await store.users.findOrCreate({
            where: { email },
        });

        const user = { ...foundUser.dataValues };

        return { user };
    },
    dataSources: () => ({
        launchAPI: new LaunchAPI(),
        userAPI: new UserAPI({ store }),
    }),
});

const PORT = process.env.PORT;

apolloServer.listen({ port: PORT }).then(() => {
    console.log(
        `🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
    console.log(
        `🚀 Subscription endpoint ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`,
    );
});
