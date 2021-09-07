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
            ? response.map(launch => this.launchReducer(launch))
            : [];
    }

    async getLaunchById({ launchId }: { launchId: string }) {
        const response = await this.get('launches', {
            flight_number: launchId,
        });

        return this.launchReducer(response[0]);
    }

    getLaunchesByIds({ launchIds }: { launchIds: string[] }) {
        return Promise.all(
            launchIds.map(launchId => this.getLaunchById({ launchId })),
        );
    }

    launchReducer(launch: any) {
        return {
            id: launch.flight_number ?? '0',
            cursor: launch.flight_number ?? 0,
            site: launch.launch_site && launch.launch_site.site_name,
            mission: {
                name: launch.mission_name,
                missionPatchSmall: launch.links.mission_patch_small,
                missionPatchLarge: launch.links.mission_patch,
            },
            rocket: {
                id: launch.rocket.rocket_id,
                name: launch.rocket.rocket_name,
                type: launch.rocket.rocket_type,
            },
        };
    }
}
