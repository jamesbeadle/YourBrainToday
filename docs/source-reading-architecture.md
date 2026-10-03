# Reading a Source — Architecture

How a document, a note, or data sent in over MCP or the API becomes knowledge in the
four brains, without a single request having to survive the whole job.

## One sentence

A source is read in four stages on its own row — the modeller, then the experience,
process and people harvests — one request per stage, claimed atomically, resumed where it
stopped, and paid for by the brain's owner whichever door it came through.

## Why stages

Before this, one HTTP request downloaded the file, made one long Claude call for the
model and three more in parallel for the harvests, and wrote everything as it went. On a
serverless host that request has a hard ceiling, and when it was cut off nothing ran the
`catch`: the row stayed "Waiting", the reserved credits were never refunded, the pages
already written had no event, and the person saw "Something went wrong". Two tabs could
start the same reading twice. A harvest that threw after it had filed left its episodes
behind for the next attempt to duplicate. Data sent over MCP ran as the service role,
which has no `auth.uid()`, so every new page failed its not-null owner, and every harvest
failed its credit spend.

Stages make every one of those a known state. Each stage is one Claude call inside one
request. The row says which stage is next; a stage that dies with its function is simply
still next.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Owner | to drop several documents at once and watch each one go through its stages | feeding the brain is one gesture, not one wait per file |
| Owner | a reading that fails to say why, and to pick up where it stopped | I never pay twice for the stages that worked |
| Owner | to see what each source added — pages, episodes, tasks, people | I can tell whether the brain understood it |
| Owner | my own Claude, or another product, to send data in and have it read the same way | the brain learns from wherever the business already works |
| Collaborator | my upload to go to the owner for review | I can contribute without changing the model myself |

## The stage machine

```
uploaded ──claim──▶ reading [model] ──▶ reading [experience] ──▶ reading [process] ──▶ reading [people] ──▶ ingested
failed   ──claim──▶ reading [stage it failed on]                           any stage ──throw──▶ failed (stage kept)
ingested ──claim──▶ reading [model]   (a re-read)                          model stage, collaborator ──▶ proposed
```

`brain_sources` carries the state (migration 0056): `status`, `stage`, `stage_started_at`,
`failure`, `reserved_credits` and `progress` — the counts each stage added, the log line
so far, and every metered Claude call, so the bill can be settled across requests.

**Claiming** (`claimSourceReading`) reserves the credits for the file's size from the
payer, then moves the row to `reading` *only if its status is still what the caller saw*;
two requests racing for one source agree on the winner. A failed reading resumes at its
failed stage with the progress of the stages before it.

**Claiming a stage** (`claimReadingStage`) stamps `stage_started_at` only when the row
still names that stage and the stamp is empty or older than eight minutes — longer than
any function that could still be running it. So a second tab, a retried request and a
dead function all resolve without a second run.

**Running a stage** (`runReadingStage`): the model stage reads the file, updates the
contexts and pages, retires what the source superseded, records the events, and keeps the
source summary — or, when a collaborator sent it, files the changes as proposals and ends
the reading there. Each harvest stage reads the file afresh and asks one brain to take
what applies to it, charging the owner per item filed. On success the row advances; after
the last stage the `source_ingested` event is written, the row is `ingested`, and the
marked-up bill is settled against the reserve. On a throw the row is `failed` with the
reason, the stage kept, and the reserve refunded.

**Driving it.** The browser asks `POST /api/brain/sources/{id}/read` once per stage
(`readSourceStages`) and shows the stage the server names. An MCP server or an API client
has nobody to ask again, so `readSourceToCompletion` runs every stage in turn inside its
one call. A chatbot owner's teaching note goes the same way.

## Paying

The owner pays whichever door the data came through (`readingPayments`): the sized reserve
through the service-role `settle_credits_for`, harvests the same way as items are filed,
the final settlement or refund over the calls the row kept. A reading of a sent document
no longer fails on `not_signed_in`.

## Writing on the owner's behalf

`brain_pages`, `brain_contexts`, `brain_page_revisions`, `brain_sources`, `kb_brain_items`
and `kb_brains` fill their owner from the brain when a row arrives with none — the service
role's rows — the way `brain_events` already did. A process map redrawn from a document is
saved through `save_workflow_map_for`, service-only, in the owner's name.

## Provenance

Items a source files carry its id as well as its name (`sourceProvenance`), so forgetting
or re-reading one source never touches another that shares a filename; items filed under
the name alone, before ids were kept, are still matched by name.

## Claude

`requestAnthropic` now times out each attempt and retries overloads and rate limits inside
one function's budget. `requestToolCall` asks the models that refuse a forced tool choice
once more when they answer in prose, instead of failing the job.

## Files

```
src/lib/data/sourceReading.ts                 stages, labels, progress, when a stage has stalled
src/lib/server/brain/reading/
  claimSourceReading.ts    begin or resume      claimReadingStage.ts     take one stage; advance
  runReadingStage.ts       one stage, one request                        readSourceToCompletion.ts  every stage, one caller
  modelStage.ts            the modeller, or a proposal                   harvestStage.ts            experience · process · people
  finishReading.ts         ingested, or failed with the reason           readingPayments.ts         reserve · charge · settle · refund
  loadSourceContent.ts     the file as Claude reads it, sized truthfully readingState.ts            the row as the list shows it
src/routes/api/brain/sources/[sourceId]/read/+server.ts    one stage per request
src/lib/components/brain/readSourceStages.ts               the browser's loop
src/lib/server/anthropic/{anthropicRetry,requestToolCall}.ts
migrations/0056_source_reading_and_search.sql
```
