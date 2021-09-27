/* Instruments */
import * as gql from '../graphql';
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

        const success = bookedTrips.length === launchIds.length;

        return {
            success,
            message: success
                ? 'trips booked successfully'
                : `the following launches couldn't be booked: ${launchIds.filter(
                    id => !bookedTrips.filter(trip => String(trip.id) === id),
                )}`,
            launches,
        };
    },
    cancelTrip: async (_, args, { dataSources }) => {
        const { tripId } = args;

        const cancelledTrip = await dataSources.userAPI.cancelTrip(tripId);

        if (!cancelledTrip) {
            return {
                success:  false,
                message:  'failed to cancel trip',
                launches: [],
            };
        }

        const launch = await dataSources.spaceXAPI.getLaunch(
            cancelledTrip.launchId,
        );

        return {
            success:  true,
            message:  'trip cancelled',
            launches: [ launch ],
        };
    },
};

/* Types */
interface TMutation {
    login: Resolver<unknown, gql.MutationLoginArgs>;
    bookTrips: Resolver<unknown, gql.MutationBookTripsArgs>;
    cancelTrip: Resolver<unknown, gql.MutationCancelTripArgs>;
}
