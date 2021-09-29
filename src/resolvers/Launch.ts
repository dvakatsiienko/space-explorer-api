/* Instruments */
import { Resolver } from '../types';
import * as gql from '../graphql';

export const Launch: LaunchResolvers = {
    isBooked: async (launch, _, { dataSources }) => {
        return dataSources.userAPI.isBookedOnLaunch(launch.id);
    },
};

/* Types */
interface LaunchResolvers {
    isBooked: Resolver<gql.Launch>;
}
