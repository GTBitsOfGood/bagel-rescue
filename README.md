# Bagels Rescue

## Stack

- React.js: Front-end
- Next.js: API routes and server-side rendering
- MongoDB: Permanently storing info
- Mail System???
- Netlify: Deployment and preview envs
- npm: Package management.

## Setup

### Initializing Env Vars

- If you are an EM setting up a project for the first time, read [the Bitwarden guide here](https://gtbitsofgood.notion.site/Secrets-Passwords-Bitwarden-74c4806a1f29485b8fb85ea29f273ab9) before continuing forward.
- Run `npm run secrets:linux` for mac/linux or `npm run secrets:windows` on windows to sync development secrets from Bitwarden and save them to a local `.env` file. Contact a leadership member for the Bitwarden password.

### Updating Env Vars

- For dev, update `.env` and `next.config.js`
- For production, add the env vars to your host, **NEVER** commit `.env` to your version control system.

## Running

### Development

To understand this code better, read the [Code Tour](/CODETOUR.md).

1. Run `npm run dev`

![image info](./public/images/bog.svg)
