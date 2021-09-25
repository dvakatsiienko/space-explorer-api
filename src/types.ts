/* Core */
import { GraphQLFieldResolver } from 'graphql';

import { LaunchAPI, UserAPI } from './datasources';

export type Resolver<
    TSource = unknown,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<
    TSource,
    {
        userEmail: string | null;
        dataSources: {
            launchAPI: LaunchAPI;
            userAPI: UserAPI;
        };
    },
    TArgs
>;
