/* Instruments */
import { Resolver } from '../types';
import * as types from '../datasources/SpaceXAPI';

export const Mission: MissionResolvers = {
    missionPatch: (mission, args = { size: 'LARGE' }) => {
        const { size } = args;

        return size === 'SMALL'
            ? mission.missionPatchSmall
            : mission.missionPatchLarge;
    },
};

/* Types */
interface MissionResolvers {
    missionPatch: Resolver<types.TMission>;
}
