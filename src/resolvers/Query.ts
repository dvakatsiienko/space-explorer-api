/* Instruments */
import { paginate } from '../utils';
import { Resolver } from '../types';

export const Query: TQuery = {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
        const allLaunches = await dataSources.spaceXAPI.getLaunches();

        const launches = paginate({
            after,
            pageSize,
            results: allLaunches,
        });

        return {
            list:   launches,
            cursor: launches.length
                ? launches[ launches.length - 1 ].flightNumber
                : null,
            hasMore: launches.length
                ? launches[ launches.length - 1 ].flightNumber
                  !== allLaunches[ allLaunches.length - 1 ].flightNumber
                : false,
        };
    },
    launch: (_, { id }, { dataSources }) => {
        return dataSources.spaceXAPI.getLaunch(id);
    },
    userProfile: (_, __, ctx) => {
        if (!ctx.userEmail) {
            throw new Error('No email provided.');
        }

        return ctx.dataSources.userAPI.findOrCreate(ctx.userEmail);
    },
};

/* Types */
interface TQuery {
    launches: Resolver<unknown, { pageSize: number; after: number }>;
    launch: Resolver<unknown, { id: string }>;
    userProfile: Resolver;
}
