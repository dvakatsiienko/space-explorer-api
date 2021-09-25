/* Core */
import { RESTDataSource } from 'apollo-datasource-rest';

/* Instruments */
import { Launch, Rocket, Launchpad } from '../types/SpaceXAPI';

export class SpaceXAPI extends RESTDataSource {
    constructor() {
        super();

        this.baseURL = 'https://api.spacexdata.com';
    }

    async getLaunches() {
        const launches = await this.get<Launch[]>('/v5/launches');

        const { rockets, launchpads } = await this.collectLaunchData(launches);

        const launchModels = launches.map(
            launch =>
                new LaunchModel(launch, rockets.flat(), launchpads.flat()),
        );

        return launchModels;
    }

    async getLaunch(id: string) {
        const launch = await this.get<Launch>(`/v5/launches/${id}`);

        const { rockets, launchpads } = await this.collectLaunchData([launch]);

        const launchModel = new LaunchModel(launch, rockets, launchpads);

        return launchModel;
    }

    async collectLaunchData(launches: Launch[]) {
        const [rockets, launchpads] = await Promise.all([
            Promise.all(
                launches.map(launch =>
                    this.get<Rocket>(`/v4/rockets/${launch.rocket}`),
                ),
            ),
            Promise.all(
                launches.map(launch =>
                    this.get<Launchpad>(`/v4/launchpads/${launch.launchpad}`),
                ),
            ),
        ]);

        return { rockets, launchpads };
    }

    async getLaunchesByIds(ids: string[]) {
        const launches = await Promise.all(ids.map(id => this.getLaunch(id)));

        return launches;
    }
}

export class LaunchModel {
    id: string;
    flightNumber: number;
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

    constructor(launch: Launch, rockets: Rocket[], launchpads: Launchpad[]) {
        this.id = launch.id;
        this.flightNumber = launch.flight_number;

        const launchpad = launchpads.find(
            launchpad => launchpad.id === launch.launchpad,
        );

        if (!launchpad) {
            throw new Error(
                `Launchpad for a ${launch.name} launch was not found!`,
            );
        }

        this.site = launchpad.name;
        this.mission = {
            name: launch.name,
            missionPatchSmall: launch.links.patch.small,
            missionPatchLarge: launch.links.patch.large,
        };

        const rocket = rockets.find(rocket => rocket.id === launch.rocket);

        if (!rocket) {
            throw new Error(`Rocket for ${launch.name} launch was not found!`);
        }

        this.rocket = {
            id: rocket.id,
            name: rocket.name,
            type: rocket.type,
        };
    }
}
