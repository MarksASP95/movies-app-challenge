  ## Zarego Code Challenge

Marco Suarez\
Delivered on November 12, 2025

### Summary

This is my submission of the Code Challenge from Zarego. First of all, I am thankful for this opportunity. This project allowed me to face interesting technical challenges and build an application that I’m proud of.

### Stack

- [NextJS 15 with App Router](https://nextjs.org/docs/15/app/getting-started)
- [Auth0](https://auth0.com/)
- ~~AWS Amplify~~ [Vercel*](https://vercel.com)
- [PostegreSQL](https://www.postgresql.org/)
  - [ORM: Drizzle](https://orm.drizzle.team/)
  - Hosted on [Render](https://render.com/) or locally
- [TailwindCSS](https://tailwindcss.com/)
  - [Skeleton Design System](https://www.skeleton.dev/)

> Note: On Vercel over AWS Amplify\
Amplify had serious issues providing the client with the session cookie. It randomly stripped it away, which made it impossible to use the app core functionalities like managing favorites or get recommendations. I debugged for a whole day with no avail. I decided to deploy to Vercel, which did not have this issue. I understand if this would be a fault for the challenge, but I wanted to deliver it in any way I could.

### External APIs

- [TMDB](https://www.themoviedb.org/)
- [OpenAI](https://openai.com/api/)

### Uses of AI
- Testing environment setup
- Test cases recommendations
- React debugging
- Auth0 flow guidance

### Run locally
In order to run the project locally, there are two prerequisites:
1. Set up local PostgreSQL database
    - Run `psql postgres` to enter the psql shell
    - Create the database by running `CREATE DATABASE movies_app;`
    - Exit the shell
2. Add the `.env` file to the root of the project. It’s attached to the email sent to Matias and Giuliana.
3. `npm i` to install dependencies
4. `npx drizzle-kit migrate` to create the migrations
5. `npm run dev` to start the app

### Run tests
- In realtime: `npm run test`
- Once: `npm run test:run`

### Deploy
- Deployments are made by pushing to the `main` branch

### Notes
- Auth0 free trial expires on **November 21**
- Render free trial expires on **December 1**
- As of today, the latest version of `@auth0/nextjs-auth0` is not compatible with NextJS 16. That’s the reason I downgraded to 15.
- The OpenAI API account is using a paid tier, but no worries.

### Extras
- Trending movies. A view that shows the most popular movies today. It allows the user to check out movies from the start, without having to search.
- Interactive rating. The interactive stars allow users to easily rate movies.
- One-click recommendation search. By clicking on a recommendations, it redirects the user to the search view with search results from its title.

### Public link
[Public link](https://movies-app-challenge.vercel.app/)

### Video
[Video](https://www.youtube.com/watch?v=rw0ogbhcvTU)
