/* Core */
import { GraphQLFieldResolver } from 'graphql';

export type Resolver<
    TSource = unknown,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<
    TSource,
    {
        user: {
            id: string;
            email: string;
        };
        dataSources: {
            launchAPI: any;
            userAPI: any;
        };
    },
    TArgs
>;
