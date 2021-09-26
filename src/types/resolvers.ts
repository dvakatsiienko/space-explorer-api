/* Core */
import { GraphQLFieldResolver } from 'graphql';

/* Instruments */
import { SpaceXAPI, UserAPI } from '../datasources';

export type Resolver<
    TSource = unknown,
    TArgs = { [argName: string]: any },
> = GraphQLFieldResolver<TSource, ResolverCtx, TArgs>;

export interface ApolloCtx {
    userEmail: string | null;
}

export interface ResolverCtx extends ApolloCtx {
    userEmail: string | null;
    dataSources: {
        spaceXAPI: SpaceXAPI;
        userAPI: UserAPI;
    };
}
