# Simple Init Parallel

Initialize three parallel git worktree directories for concurrent development.

## Variables

FEATURE_NAME: $ARGUMENTS

## Execute these tasks

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> Use absolute paths for all commands

CREATE first worktree:
- RUN `git worktree add -b FEATURE_NAME-1 ./trees/FEATURE_NAME-1`
- COPY `.env.local` to `./trees/FEATURE_NAME-1/.env.local`
- RUN `cd ./trees/FEATURE_NAME-1` then `npm install`
- UPDATE `./trees/FEATURE_NAME-1/next.config.js` port to `3001`

CREATE second worktree:
- RUN `git worktree add -b FEATURE_NAME-2 ./trees/FEATURE_NAME-2`
- COPY `.env.local` to `./trees/FEATURE_NAME-2/.env.local`
- RUN `cd ./trees/FEATURE_NAME-2` then `npm install`
- UPDATE `./trees/FEATURE_NAME-2/next.config.js` port to `3002`

CREATE third worktree:
- RUN `git worktree add -b FEATURE_NAME-3 ./trees/FEATURE_NAME-3`
- COPY `.env.local` to `./trees/FEATURE_NAME-3/.env.local`
- RUN `cd ./trees/FEATURE_NAME-3` then `npm install`
- UPDATE `./trees/FEATURE_NAME-3/next.config.js` port to `3003`

VERIFY setup by running `git worktree list`