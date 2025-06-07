# Simple Init Parallel

Initialize three parallel git worktree directories for concurrent development.

## Variables

FEATURE_NAME: $ARGUMENTS

## Execute these commands

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> CRITICAL: Follow EXACT Sprint 1 success pattern (4 steps only)

CREATE first worktree:
- RUN `git worktree add -b FEATURE_NAME-1 ./trees/FEATURE_NAME-1`
- COPY `.env.local` to `./trees/FEATURE_NAME-1/.env.local`
- RUN `cd ./trees/FEATURE_NAME-1` then `npm install`
- UPDATE `./trees/FEATURE_NAME-1/next.config.js` to add server port configuration:
  ```javascript
  // Configure port for this worktree
  server: {
    port: 3001
  }
  ```

CREATE second worktree:
- RUN `git worktree add -b FEATURE_NAME-2 ./trees/FEATURE_NAME-2`
- COPY `.env.local` to `./trees/FEATURE_NAME-2/.env.local`
- RUN `cd ./trees/FEATURE_NAME-2` then `npm install`
- UPDATE `./trees/FEATURE_NAME-2/next.config.js` to add server port configuration:
  ```javascript
  // Configure port for this worktree
  server: {
    port: 3002
  }
  ```

CREATE third worktree:
- RUN `git worktree add -b FEATURE_NAME-3 ./trees/FEATURE_NAME-3`
- COPY `.env.local` to `./trees/FEATURE_NAME-3/.env.local`
- RUN `cd ./trees/FEATURE_NAME-3` then `npm install`
- UPDATE `./trees/FEATURE_NAME-3/next.config.js` to add server port configuration:
  ```javascript
  // Configure port for this worktree
  server: {
    port: 3003
  }
  ```

VERIFY setup by running `git worktree list`

## Notes
- The server port configuration in next.config.js is what worked in Sprint 1
- NO echo commands to .env.local (this breaks Next.js)
- Each worktree gets its own port (3001, 3002, 3003)