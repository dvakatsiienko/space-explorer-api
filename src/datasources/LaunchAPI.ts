/* Core */
import { RESTDataSource } from 'apollo-datasource-rest';

export class LaunchAPI extends RESTDataSource {
    constructor() {
        super();

        this.baseURL = 'https://api.spacexdata.com';
    }

    async getLaunches() {
        const response: TLaunch[] = await this.get('/v5/launches');

        const rockets = await Promise.all(
            response.map(launch => this.get(`/v4/rockets?id=${launch.rocket}`)),
        );

        // console.log(rockets.length);
        // console.log(rockets.flat().length);
        // console.log(rockets[0]);

        // console.log(response[0]);

        return Array.isArray(response)
            ? response.map(launch => new Launch(launch, rockets.flat()))
            : [];
    }

    async getLaunch(id: number) {
        const [launch]: TLaunch[] = await this.get('launches', {
            flight_number: id,
        });

        const rocket = await this.get(`/v4/rockets?id=${launch.rocket}`);

        return new Launch(launch, [rocket]);
    }

    getLaunchesByIds(launchIds: number[]) {
        return Promise.all(launchIds.map(id => this.getLaunch(id)));
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

    constructor(launch: TLaunch, rockets: TRocket[]) {
        this.id = launch.id;
        this.cursor = launch.flight_number;
        // @ts-ignore
        this.site = launch.launch_site && launch.launch_site.site_name;
        this.mission = {
            // @ts-ignore
            name: launch.mission_name,
            missionPatchSmall: launch.links.patch.small,
            missionPatchLarge: launch.links.patch.large,
        };

        const rocket = rockets.find(rocket => rocket.id === launch.rocket);
        console.log('found', rocket);

        if (!rocket) {
            throw new Error(
                `Rocket for a launch ${launch.name} was not found!`,
            );
        }

        console.log('...');

        this.rocket = {
            id: rocket.id,
            name: rocket.name,
            type: rocket.type,
        };
    }
}

/* Types */
// !Launch
export interface TLaunch {
    fairings: null;
    links: Links;
    static_fire_date_utc: Date;
    static_fire_date_unix: number;
    tdb: boolean;
    net: boolean;
    window: number;
    rocket: string;
    success: boolean;
    failures: any[];
    details: string;
    crew: any[];
    ships: any[];
    capsules: string[];
    payloads: string[];
    launchpad: string;
    auto_update: boolean;
    flight_number: number;
    name: string;
    date_utc: Date;
    date_unix: number;
    date_local: Date;
    date_precision: string;
    upcoming: boolean;
    cores: Core[];
    id: string;
}

export interface Core {
    core: string;
    flight: number;
    gridfins: boolean;
    legs: boolean;
    reused: boolean;
    landing_attempt: boolean;
    landing_success: boolean;
    landing_type: string;
    landpad: string;
}

export interface Links {
    patch: Patch;
    reddit: Reddit;
    flickr: Flickr;
    presskit: string;
    webcast: string;
    youtube_id: string;
    article: string;
    wikipedia: string;
}

export interface Flickr {
    small: any[];
    original: string[];
}

export interface Patch {
    small: string;
    large: string;
}

export interface Reddit {
    campaign: string;
    launch: string;
    media: string;
    recovery: null;
}

// !Rocket
export interface TRocket {
    height: Diameter;
    diameter: Diameter;
    mass: Mass;
    first_stage: FirstStage;
    second_stage: SecondStage;
    engines: Engines;
    landing_legs: LandingLegs;
    payload_weights: PayloadWeight[];
    flickr_images: string[];
    name: string;
    type: string;
    active: boolean;
    stages: number;
    boosters: number;
    cost_per_launch: number;
    success_rate_pct: number;
    first_flight: Date;
    country: string;
    company: string;
    wikipedia: string;
    description: string;
    id: string;
}

export interface Diameter {
    meters: number;
    feet: number;
}

export interface Engines {
    isp: ISP;
    thrust_sea_level: Thrust;
    thrust_vacuum: Thrust;
    number: number;
    type: string;
    version: string;
    layout: string;
    engine_loss_max: number;
    propellant_1: string;
    propellant_2: string;
    thrust_to_weight: number;
}

export interface ISP {
    sea_level: number;
    vacuum: number;
}

export interface Thrust {
    kN: number;
    lbf: number;
}

export interface FirstStage {
    thrust_sea_level: Thrust;
    thrust_vacuum: Thrust;
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number;
}

export interface LandingLegs {
    number: number;
    material: string;
}

export interface Mass {
    kg: number;
    lb: number;
}

export interface PayloadWeight {
    id: string;
    name: string;
    kg: number;
    lb: number;
}

export interface SecondStage {
    thrust: Thrust;
    payloads: Payloads;
    reusable: boolean;
    engines: number;
    fuel_amount_tons: number;
    burn_time_sec: number;
}

export interface Payloads {
    composite_fairing: CompositeFairing;
    option_1: string;
}

export interface CompositeFairing {
    height: Diameter;
    diameter: Diameter;
}
