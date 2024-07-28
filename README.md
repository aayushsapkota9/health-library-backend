## Installing elastic db

Install docker on your machine
Create a .env in the root of your directory and add the contents from .env.example

```bash
$ docker compose up -d

```

Use docker to run elastic search services and replace if any configuration changes occur in .env

## Installing postgres

Setup a postgres database and create a db named "healthlibrarydb"
Navigate to "health-library-backend/src/db/dbconfig.ts" and change the configuration

## Installationn

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
The app can be opened at port http://localhost:3000 as default or any other as per config
# Stop the app once and seed the database 

```bash
# development
$ npm run seed
```
