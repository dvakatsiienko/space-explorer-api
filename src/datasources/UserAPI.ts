/* Core */
import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient();

interface Ctx {
    userEmail: string | null;
}

export class UserAPI extends DataSource {
    context: Ctx = { userEmail: null };

    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests.
     */
    async initialize(config: DataSourceConfig<Ctx>) {
        this.context = config.context;
        await client.$connect();
    }

    async findOrCreate(email: string) {
        let user = await client.user.findUnique({
            where: { email },
        });

        if (user === null) {
            user = await client.user.create({
                data: { email },
            });
        }

        user.token = Buffer.from(email).toString('base64');

        return user;
    }

    async bookTrips(launchIds: string[]) {
        if (!this.context.userEmail) {
            return null;
        }

        let results = [];

        for (const launchId of launchIds) {
            const res = await this.bookTrip(launchId);

            if (res) results.push(res);
        }

        return results;
    }

    async bookTrip(launchId: string) {
        if (!launchId || !this.context.userEmail) {
            return null;
        }

        const user = await client.user.findUnique({
            where: { email: this.context.userEmail },
        });

        if (user === null) {
            return null;
        }

        let trip = await client.trip.findUnique({
            where: { launchId, userId: user?.id },
        });

        if (trip === null) {
            trip = await client.trip.create({
                data: { launchId, userId: user?.id },
            });
        }

        return trip;
    }

    async cancelTrip(launchId: string) {
        const isCanceled = await client.trip.delete({
            where: { launchId },
        });

        return isCanceled;
    }

    async getLaunchIds() {
        if (this.context.userEmail === null) {
            return [];
        }

        const user = await client.user.findUnique({
            where: { email: this.context.userEmail },
            include: { trips: true },
        });

        if (!user) return [];

        const userTrips = user.trips;

        return userTrips.map(trip => trip.launchId);
    }

    async isBookedOnLaunch(launchId: string) {
        if (this.context.userEmail === null) return false;

        const user = await client.user.findUnique({
            where: { email: this.context.userEmail },
            include: { trips: true },
        });

        if (!user) return false;

        const found = await client.trip.findMany({
            where: { id: user.id, launchId },
        });

        return found && found.length > 0;
    }
}
