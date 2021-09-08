/* Core */
import { ApolloServer } from 'apollo-server';
import { join } from 'path';
import { loadSchemaSync } from '@graphql-tools/load';
import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader';
import isEmail from 'isemail';
import dotenv from 'dotenv';
import type { DocumentNode } from 'graphql';

dotenv.config();

/* Instruments */
import { resolvers } from './resolvers';
import { createStore } from './utils';
import { LaunchAPI, UserAPI } from './datasources';

const store = createStore();

const schema = loadSchemaSync(join(__dirname, './schema.graphql'), {
    loaders: [new GraphQLFileLoader()],
}) as unknown as DocumentNode;

const server = new ApolloServer({
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

server.listen({ port: process.env.PORT || 4000 }).then(() => {
    console.log(`
      Server is running!
      Listening on port ${process.env.PORT || 4000}
      Explore at https://studio.apollographql.com/sandbox
    `);
});
