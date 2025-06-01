# Simple Init Parallel
Initialize three parallel git worktree directories for concurrent BrandFontsIQ v15 development.

## Variables
SPRINT_NAME: $ARGUMENTS

## Execute these tasks

CREATE new directory `trees/`

> Execute these steps in parallel for concurrency
>
> Use absolute paths for all commands

CREATE first worktree:
- RUN `git worktree add -b SPRINT_NAME-agent-1 ./trees/SPRINT_NAME-agent-1`
- COPY `.env.local` to `./trees/SPRINT_NAME-agent-1/.env.local` (if exists)
- RUN `cd ./trees/SPRINT_NAME-agent-1` then `npm install`
- CREATE `.env.local` with `PORT=3001` if it doesn't exist
- COPY corrected sprint specification from docs/plans/parallel-agents/

CREATE second worktree:
- RUN `git worktree add -b SPRINT_NAME-agent-2 ./trees/SPRINT_NAME-agent-2`
- COPY `.env.local` to `./trees/SPRINT_NAME-agent-2/.env.local` (if exists)
- RUN `cd ./trees/SPRINT_NAME-agent-2` then `npm install`
- CREATE `.env.local` with `PORT=3002` if it doesn't exist
- COPY corrected sprint specification from docs/plans/parallel-agents/

CREATE third worktree:
- RUN `git worktree add -b SPRINT_NAME-agent-3 ./trees/SPRINT_NAME-agent-3`
- COPY `.env.local` to `./trees/SPRINT_NAME-agent-3/.env.local` (if exists)
- RUN `cd ./trees/SPRINT_NAME-agent-3` then `npm install`
- CREATE `.env.local` with `PORT=3003` if it doesn't exist
- COPY corrected sprint specification from docs/plans/parallel-agents/

VERIFY setup by running `git worktree list`

## Notes
- Each agent works on the same sprint specification independently
- Ports 3001-3003 prevent conflicts when running multiple Next.js instances
- Sprint specifications should be in docs/plans/parallel-agents/
- Usage: `/project:simple-init-parallel unique-fonts`