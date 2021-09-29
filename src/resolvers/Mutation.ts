/* Instruments */
import * as gql from '../graphql';
import { injectLaunchesIntoTrips } from '../utils';
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

        const finalTrips = injectLaunchesIntoTrips(bookedTrips, launches);

        return finalTrips;
    },
    cancelTrip: async (_, args, { dataSources }) => {
        const { tripId } = args;

        await dataSources.userAPI.cancelTrip(tripId);

        return true;
    },
};

/* Types */
interface TMutation {
    login: Resolver<unknown, gql.MutationLoginArgs>;
    bookTrips: Resolver<unknown, gql.MutationBookTripsArgs>;
    cancelTrip: Resolver<unknown, gql.MutationCancelTripArgs>;
}
