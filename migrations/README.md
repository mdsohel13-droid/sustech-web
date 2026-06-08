# Database migrations

Payload writes generated migration files here. They are committed to the repo so
production schema changes are **deterministic and reviewable** — not inferred at
boot time.

## Why this exists

In development and CI the Postgres adapter uses `push` (auto-sync) — see
`payload.config.ts`. In **production `push` is OFF**, because letting an ORM
infer schema changes against live data can drop columns/tables on ambiguous
diffs (e.g. enum changes). Production schema is changed only by applying the
SQL migrations in this folder.

## Workflow when you change a collection/global/field

1. Make the schema change in code (add a field, collection, etc.).
2. Generate a migration **against a database that has the current/old schema**
   (e.g. a staging DB, or production itself for a recovery):

   ```bash
   pnpm migrate:create        # writes a new timestamped file into ./migrations
   ```

3. **Review the generated SQL.** Confirm it only ADDs (columns/tables) or does
   intended changes — no unexpected `DROP`.
4. Commit the migration file with the code change.
5. On deploy, apply pending migrations:

   ```bash
   pnpm migrate               # applies anything not yet recorded in payload_migrations
   pnpm migrate:status        # shows applied / pending
   ```

> Node note: the Payload CLI runs on the VPS (Node 22). Local dev here is Node
> 24, where the CLI can be unreliable — generate/apply migrations on the server
> or a Node 20/22 environment.

## Emergency escape hatch

If you must force a schema sync without a migration (last resort — **take a
`pg_dump` backup first**):

```bash
PAYLOAD_DB_PUSH=true pm2 restart sustech-web --update-env   # one boot
pm2 restart sustech-web --update-env                        # then unset
```
