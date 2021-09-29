/* Instruments */
import { injectLaunchesIntoTrips } from '../utils';
import { Resolver } from '../types';
import * as gql from '../graphql';
import * as types from '../datasources/SpaceXAPI';

export const Launch: TLaunch = {
    isBooked: async (launch, _, { dataSources }) => {
        return dataSources.userAPI.isBookedOnLaunch(launch.id);
    },
};

export const Mission: TMission = {
    missionPatch: (mission, args = { size: 'LARGE' }) => {
        const { size } = args;

        return size === 'SMALL'
            ? mission.missionPatchSmall
            : mission.missionPatchLarge;
    },
};

export const UserProfile: TUserProfile = {
    trips: async (_, __, { dataSources }) => {
        const userTrips = await dataSources.userAPI.getTrips();

        const launchIds = userTrips.map(trip => trip.launchId);
        const launches = await dataSources.spaceXAPI.getLaunchesByIds(
            launchIds,
        );

        const finalTrips = injectLaunchesIntoTrips(userTrips, launches);

        return finalTrips;
    },
};

/* Types */
interface TLaunch {
    isBooked: Resolver<gql.Launch>;
}
interface TMission {
    missionPatch: Resolver<types.TMission>;
}
interface TUserProfile {
    trips: Resolver;
}
