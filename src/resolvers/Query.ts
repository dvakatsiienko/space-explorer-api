/* Instruments */
import { paginate } from '../utils';
import { Resolver } from '../types';

export const Query: TQuery = {
    launches: async (_, { pageSize = 20, after }, { dataSources }) => {
        const launches = await dataSources.spaceXAPI.getLaunches();

        const list = paginate({
            after,
            pageSize,
            results: launches,
        });

        return {
            list,
            cursor:  list.length ? list[ list.length - 1 ].flightNumber : null,
            hasMore: list.length
                ? list[ list.length - 1 ].flightNumber
                  !== launches[ launches.length - 1 ].flightNumber
                : false,
        };
    },
    launch: (_, args, { dataSources }) => {
        const { id } = args;

        return dataSources.spaceXAPI.getLaunch(id);
    },
    userProfile: (_, __, ctx) => {
        return ctx.dataSources.userAPI.find();
    },
};

/* Types */
interface TQuery {
    launches: Resolver<unknown, { pageSize: number; after: number }>;
    launch: Resolver<unknown, { id: string }>;
    userProfile: Resolver;
}
