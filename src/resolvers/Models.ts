/* Instruments */
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
        const launchIds = await dataSources.userAPI.getLaunchIds();

        if (!launchIds.length) return [];

        return dataSources.spaceXAPI.getLaunchesByIds(launchIds);
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
    trips: Resolver<unknown>;
}
