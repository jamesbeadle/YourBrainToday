# Refactoring plan

Written by the code quality check at a score of 83.3%. These are the steps a refactor of this repository follows, in this order; a round takes the next steps from the top. The plan is measured, so a finished step is gone the next time the check runs. The facts are measured; the judgement is the round's.

## The order

**Pass 4 — Design pattern identification**

1. Complete the pattern: every +page.server.ts has a +page.svelte. 7 of 37 lack it. Predicted: src/routes/hive-mind/+page.svelte; src/routes/knowledge/+page.svelte; src/routes/knowledge-base/+page.svelte; src/routes/knowledge-base/[knowledgeBaseId=uuid]/brains/new/+page.svelte. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.
2. Complete the pattern: every +page.svelte has a +page.server.ts. 5 of 35 lack it. Predicted: src/routes/+page.server.ts; src/routes/contact/+page.server.ts; src/routes/privacy/+page.server.ts; src/routes/terms/+page.server.ts. Find the code doing that job now and move it there; a subject that truly has no such job goes in acceptedGaps.

**Pass 5 — The sweep to zero**

3. Conditions compared to a raw literal: 251 to zero. Scores 45.2% at weight 6; the offenders are in audit.json under details.conditions, fifty at a time.
4. Long member chain lines: 435 to zero. Scores 68.7% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
5. Deeply indented lines: 284 to zero. Scores 79.6% at weight 4; the offenders are in audit.json under details.prose, fifty at a time.
6. Functions over the line limit: 59 to zero. Scores 86.3% at weight 8; the offenders are in audit.json under details.functionShape, fifty at a time.
7. Explanatory comment lines: 259 to zero. Scores 88.8% at weight 4; the offenders are in audit.json under details.comments, fifty at a time.
8. Conditions with calls tangled inside calls: 50 to zero. Scores 89.1% at weight 8; the offenders are in audit.json under details.conditions, fifty at a time.
9. Accessor names that want to be a property: 7 to zero. Scores 95.9% at weight 6; the offenders are in audit.json under details.accessorNames, fifty at a time.
10. Inline magic values: 36 to zero. Scores 96.1% at weight 4; the offenders are in audit.json under details.magicValues, fifty at a time.
11. Overlong function names: 4 to zero. Scores 97.7% at weight 4; the offenders are in audit.json under details.functionNames, fifty at a time.
12. Duplication %: 0.25 to zero. Scores 98.8% at weight 8; the offenders are in audit.json under details.duplication, fifty at a time.
13. Else blocks: 1 to zero. Scores 99.9% at weight 5; the offenders are in audit.json under details.functionShape, fifty at a time.

## The detail behind the first targets
