/* Core */
import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
    constructor() {
        super();

        this.baseURL = 'https://api.spacexdata.com/v2/';
    }

    async getAllLaunches() {
        const response = await this.get('launches');

        return Array.isArray(response)
            ? response.map(launch => new Launch(launch))
            : [];
    }

    async getLaunchById(id: number) {
        const response = await this.get('launches', {
            flight_number: id,
        });

        return new Launch(response[0]);
    }

    getLaunchesByIds(launchIds: number[]) {
        return Promise.all(launchIds.map(id => this.getLaunchById(id)));
    }
}

class Launch {
    id: string;
    cursor: number;
    site: string;
    mission: {
        name: string;
        missionPatchSmall: string;
        missionPatchLarge: string;
    };
    rocket: {
        id: string;
        name: string;
        type: string;
    };

    constructor(data: any) {
        this.id = data.flight_number ?? '0';
        this.cursor = data.flight_number ?? 0;
        this.site = data.launch_site && data.launch_site.site_name;
        this.mission = {
            name: data.mission_name,
            missionPatchSmall: data.links.mission_patch_small,
            missionPatchLarge: data.links.mission_patch,
        };
        this.rocket = {
            id: data.rocket.rocket_id,
            name: data.rocket.rocket_name,
            type: data.rocket.rocket_type,
        };
    }
}
