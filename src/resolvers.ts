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
            return dataSources.launchAPI.getLaunchById(id);
        },
        userProfile: (_, __, ctx) => {
            if (!ctx.userEmail) {
                throw new Error('No email provided.');
            }

            return ctx.dataSources.userAPI.findOrCreate(ctx.userEmail);
        },
    },

    Mutation: {
        login: async (_, { email }, { dataSources }) => {
            const userProfile = await dataSources.userAPI.findOrCreate(email);

            return userProfile;
        },
        // @ts-ignore
        bookTrips: async (
            _,
            { launchIds }: { launchIds: number[] },
            { dataSources },
        ) => {
            const bookedTrips = await dataSources.userAPI.bookTrips(launchIds);
            const launches = await dataSources.launchAPI.getLaunchesByIds(
                launchIds,
            );

            const success = bookedTrips?.length === launchIds.length;

            return {
                success,
                message: success
                    ? 'trips booked successfully'
                    : `the following launches couldn't be booked: ${launchIds.filter(
                          id => !bookedTrips?.filter(trip => trip.id === id),
                      )}`,
                launches,
            };
        },
        cancelTrip: async (_, { launchId }, { dataSources }) => {
            const result = await dataSources.userAPI.cancelTrip(launchId);

            if (!result) {
                return {
                    success: false,
                    message: 'failed to cancel trip',
                };
            }

            const launch = await dataSources.launchAPI.getLaunchById(launchId);

            return {
                success: true,
                message: 'trip cancelled',
                launches: [launch],
            };
        },
    },

    Launch: {
        isBooked: async (launch: any, _, { dataSources }) => {
            return dataSources.userAPI.isBookedOnLaunch(launch.id);
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
            const launchIds = await dataSources.userAPI.getLaunchIds();

            if (!launchIds.length) return [];

            return dataSources.launchAPI.getLaunchesByIds(launchIds);
        },
    },
};

/* Types */
interface Resolvers {
    [key: string]: {
        [key: string]: Resolver;
    };
}
