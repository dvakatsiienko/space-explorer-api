/* Instruments */
import { Resolver } from '../types';

export const Mutation: TMutation = {
    login: async (_, args, { dataSources }) => {
        const userProfile = await dataSources.userAPI.findOrCreate(args.email);

        return userProfile;
    },
    bookTrips: async (_, args, { dataSources }) => {
        const { launchIds } = args;

        const bookedTrips = await dataSources.userAPI.bookTrips(launchIds);
        const launches = await dataSources.spaceXAPI.getLaunchesByIds(
            launchIds,
        );

        const success = bookedTrips?.length === launchIds.length;

        return {
            success,
            message: success
                ? 'trips booked successfully'
                : `the following launches couldn't be booked: ${launchIds.filter(
                    id => !bookedTrips?.filter(trip => String(trip.id) === id),
                )}`,
            launches,
        };
    },
    cancelTrip: async (_, args, { dataSources }) => {
        const { launchId } = args;

        const result = await dataSources.userAPI.cancelTrip(launchId);

        if (!result) {
            return {
                success:  false,
                message:  'failed to cancel trip',
                launches: [],
            };
        }

        const launch = await dataSources.spaceXAPI.getLaunch(launchId);

        return {
            success:  true,
            message:  'trip cancelled',
            launches: [ launch ],
        };
    },
};

/* Types */
interface TMutation {
    login: Resolver<unknown, { email: string }>;
    bookTrips: Resolver<unknown, { launchIds: string[] }>;
    cancelTrip: Resolver<unknown, { launchId: string }>;
}
