export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Launch = {
  __typename?: 'Launch';
  id: Scalars['ID'];
  isBooked: Scalars['Boolean'];
  mission: Mission;
  rocket: Rocket;
  site: Scalars['String'];
};

export type LaunchConnection = {
  __typename?: 'LaunchConnection';
  cursor: Scalars['Int'];
  hasMore: Scalars['Boolean'];
  launches: Array<Launch>;
};

export type Mission = {
  __typename?: 'Mission';
  missionPatch: Scalars['String'];
  name: Scalars['String'];
};


export type MissionMissionPatchArgs = {
  size: Maybe<PatchSize>;
};

export type Mutation = {
  __typename?: 'Mutation';
  bookTrips: TripUpdateResponse;
  cancelTrip: TripUpdateResponse;
  login: UserProfile;
};


export type MutationBookTripsArgs = {
  launchIds: Array<Maybe<Scalars['ID']>>;
};


export type MutationCancelTripArgs = {
  launchId: Scalars['ID'];
  tripId: Scalars['ID'];
};


export type MutationLoginArgs = {
  email: Maybe<Scalars['String']>;
};

export enum PatchSize {
  Large = 'LARGE',
  Small = 'SMALL'
}

export type Query = {
  __typename?: 'Query';
  launch: Launch;
  launches: LaunchConnection;
  userProfile: Maybe<UserProfile>;
};


export type QueryLaunchArgs = {
  id: Scalars['ID'];
};


export type QueryLaunchesArgs = {
  after: Maybe<Scalars['Int']>;
  pageSize: Maybe<Scalars['Int']>;
};

export type Rocket = {
  __typename?: 'Rocket';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: Scalars['String'];
};

export type TripUpdateResponse = {
  __typename?: 'TripUpdateResponse';
  launches: Array<Launch>;
  message: Scalars['String'];
  success: Scalars['Boolean'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  email: Scalars['String'];
  id: Scalars['ID'];
  token: Maybe<Scalars['String']>;
  trips: Array<Launch>;
};
