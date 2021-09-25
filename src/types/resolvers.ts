/* Core */
import { GraphQLFieldResolver } from 'graphql';

/* Instruments */
import { SpaceXAPI, UserAPI } from '../datasources';

export type Resolver<
    TSource = unknown,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<
    TSource,
    {
        userEmail: string | null;
        dataSources: {
            spaceXAPI: SpaceXAPI;
            userAPI: UserAPI;
        };
    },
    TArgs
>;
