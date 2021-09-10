/* Instruments */
import { Resolver } from './types';
import { paginateResults } from './utils';

export const resolvers: Resolvers = {
    Query: {
        launches: async (_, { pageSize = 20, after }, { dataSources }) => {
            const allLaunches = await dataSources.launchAPI.getAllLaunches();

            const launches = paginateResults({
                after,
                pageSize,
                results: allLaunches,
            });

            return {
                launches,
                cursor: launches.length
                    ? launches[launches.length - 1].cursor
                    : null,
                hasMore: launches.length
                    ? launches[launches.length - 1].cursor !==
                      allLaunches[allLaunches.length - 1].cursor
                    : false,
            };
        },
        launch: (_, { id }, { dataSources }) => {
            return dataSources.launchAPI.getLaunchById({ launchId: id });
        },
        userProfile: (_, __, ctx) => {
            return ctx.dataSources.userAPI.findOrCreateUser(ctx?.user?.email);
        },
    },

    Mutation: {
        login: async (_, { email }, { dataSources }) => {
            const user = await dataSources.userAPI.findOrCreateUser(email);

            if (user) {
                user.token = Buffer.from(email).toString('base64');

                return user;
            } else {
                return null;
            }
        },
        bookTrips: async (_, { launchIds }, { dataSources }) => {
            const results = await dataSources.userAPI.bookTrips({ launchIds });
            const launches = await dataSources.launchAPI.getLaunchesByIds({
                launchIds,
            });

            return {
                success: results?.length === launchIds.length,
                message:
                    results?.length === launchIds?.length
                        ? 'trips booked successfully'
                        : `the following launches couldn't be booked: ${launchIds.filter(
                              (id: string) => !results?.includes(id),
                          )}`,
                launches,
            };
        },
        cancelTrip: async (_, { launchId }, { dataSources }) => {
            const result = await dataSources.userAPI.cancelTrip({ launchId });

            if (!result) {
                return {
                    success: false,
                    message: 'failed to cancel trip',
                };
            }

            const launch = await dataSources.launchAPI.getLaunchById({
                launchId,
            });

            return {
                success: true,
                message: 'trip cancelled',
                launches: [launch],
            };
        },
    },

    Launch: {
        isBooked: async (launch: any, _, { dataSources }) => {
            return dataSources.userAPI.isBookedOnLaunch({
                launchId: launch.id,
            });
        },
    },

    Mission: {
        missionPatch: (mission: any, { size } = { size: 'LARGE' }) => {
            return size === 'SMALL'
                ? mission.missionPatchSmall
                : mission.missionPatchLarge;
        },
    },

    UserProfile: {
        trips: async (_, __, { dataSources }) => {
            const launchIds = await dataSources.userAPI.getLaunchIdsByUser();

            if (!launchIds.length) return [];

            return (
                dataSources.launchAPI.getLaunchesByIds({
                    launchIds,
                }) || []
            );
        },
    },
};

/* Types */
interface Resolvers {
    [key: string]: {
        [key: string]: Resolver;
    };
}
