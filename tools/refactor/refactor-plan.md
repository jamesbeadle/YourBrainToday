# Refactoring plan

Written by the code quality check at a score of 78.9%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 3 — Utility function identification**

1. Remove the 32 components and functions nothing calls. Listed in audit.json under details.orphans and details.inventory.offenders.orphans; confirm each has no caller before it goes.

**Pass 4 — Design pattern identification**

2. Complete the pattern: every palette has a types. 1 of 5 lack it. Predicted: src/lib/components/face/reliefTypes.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
3. Complete the pattern: every +page.server.ts has a +page.svelte. 7 of 37 lack it. Predicted: src/routes/hive-mind/+page.svelte; src/routes/knowledge/+page.svelte; src/routes/knowledge-base/+page.svelte; src/routes/knowledge-base/[knowledgeBaseId=uuid]/brains/new/+page.svelte. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
4. Complete the pattern: every +page.svelte has a +page.server.ts. 5 of 35 lack it. Predicted: src/routes/+page.server.ts; src/routes/contact/+page.server.ts; src/routes/privacy/+page.server.ts; src/routes/terms/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
5. Divide `src/lib/data/brainTypes.ts` (106 lines) into the units its pattern names. 0 functions; the longest is 0 lines.

**Pass 5 — The sweep to zero**

6. Conditions compared to a raw literal: 278 to zero. Scores 41.8% at weight 6; the offenders are in audit.json under details.conditions, fifty at a time.
7. Long member chain lines: 449 to zero. Scores 68.5% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
8. Deeply indented lines: 287 to zero. Scores 79.8% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
9. Functions over the line limit: 60 to zero. Scores 86.5% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
10. Explanatory comment lines: 263 to zero. Scores 88.9% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.
11. Conditions with calls tangled inside calls: 50 to zero. Scores 89.5% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
12. Accessor names that want to be a property: 10 to zero. Scores 94.4% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
13. Inline magic values: 36 to zero. Scores 96.2% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
14. Overlong function names: 4 to zero. Scores 97.7% at weight 4; the offenders are in audit.json under details.functionNames, fifty at a time.
15. Duplication %: 0.25 to zero. Scores 98.8% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
16. Else blocks: 1 to zero. Scores 99.9% at weight 5; the offenders are in audit.json under details.functionShape, fifty at a time.

## The detail behind the first targets

### `src/lib/data/brainTypes.ts` — 106 lines
