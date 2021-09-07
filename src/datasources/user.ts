/* Core */
import { DataSource } from 'apollo-datasource';
import isEmail from 'isemail';

export class UserAPI extends DataSource {
    store: any;
    context: any;

    constructor(opts: any) {
        super();

        this.store = opts.store;
    }

    /**
     * This is a function that gets called by ApolloServer when being setup.
     * This function gets called with the datasource config including things
     * like caches and context. We'll assign this.context to the request context
     * here, so we can know about the user making requests.
     */
    initialize(config: any) {
        this.context = config.context;
    }

    /**
     * User can be called with an argument that includes email, but it doesn't
     * have to be. If the user is already on the context, it will use that user
     * instead.
     */
    async findOrCreateUser(email: string) {
        if (!email || !isEmail.validate(email)) return null;

        const users = await this.store.users.findOrCreate({ where: { email } });

        return users && users[0] ? users[0] : null;
    }

    async bookTrips({ launchIds }: { launchIds: string[] }) {
        const userId = this.context?.user?.id;

        if (!userId) return;

        let results = [];

        for (const launchId of launchIds) {
            const res = await this.bookTrip({ launchId });

            if (res) results.push(res);
        }

        return results;
    }

    async bookTrip({ launchId }: { launchId: string }) {
        const userId = this.context?.user?.id;
        if (!userId) return;

        const res = await this.store.trips.findOrCreate({
            where: { userId, launchId },
        });

        return res && res.length ? res[0].get() : false;
    }

    async cancelTrip({ launchId }: { launchId: string }) {
        const userId = this.context?.user?.id;
        if (!userId) return;

        return !!this.store.trips.destroy({ where: { userId, launchId } });
    }

    async getLaunchIdsByUser() {
        const userId = this.context?.user?.id;
        if (!userId) return [];

        const userLaunches = await this.store.trips.findAll({
            where: { userId },
        });

        return userLaunches && userLaunches.length
            ? userLaunches
                  .map((launch: any) => launch.dataValues.launchId)
                  .filter((launch: any) => !!launch)
            : [];
    }

    async isBookedOnLaunch({ launchId }: { launchId: string }) {
        if (!this.context?.user) return false;

        const userId = this.context?.user?.id;

        const found = await this.store.trips.findAll({
            where: { userId, launchId },
        });

        return found && found.length > 0;
    }
}
