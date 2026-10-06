# Refactor audit — baseline v4, after round 2

Generated 2026-10-06 from refactor/round-2, replacing the v3 baseline.

The widgets' designs: not set up. `rules.json` carries no `siteDefinition.catalogue`, so no site definition is written and no design index exists; the site has never been checked against a brand sheet (`widget-design`: *"Check the site against the brand"*) nor the widgets against their sheets (*"Check the widgets against their designs"*). The round reports this and does not run it.

## Headline

Code quality score 78.9% → 83.3%. **Code quality score 83.3%.** **0 of 1,150 source files are over the 100-line limit (0.0%)**; no file is over the limit, so the worst file reads 0.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **93.4%** | **60** | |
| Files over the line limit | 0 in 1150 files | 100.0% | 10 | 50% of files |
| Worst file, in limits over | 0 | 100.0% | 5 | 9 |
| Functions over the line limit | 59 in 1727 functions | 86.3% | 8 | 25% of functions |
| Else blocks | 1 in 1833 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.25 | 98.8% | 8 | 20 |
| Explanatory comment lines | 259 in 46.37 thousand lines | 88.8% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 46.37 thousand lines | 96.1% | 4 | 20 per thousand lines |
| Orphan components and functions | 0 in 1965 components and functions | 100.0% | 4 | 10% of components and functions |
| Long member chain lines | 435 in 46.37 thousand lines | 68.7% | 4 | 30 per thousand lines |
| Deeply indented lines | 284 in 46.37 thousand lines | 79.6% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1727 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **100.0%** | **10** | |
| Files the patterns predict but are missing | 0 in 77 predicted files | 100.0% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **78.0%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1833 branches | 89.1% | 8 | 25% of branches |
| Conditions compared to a raw literal | 251 in 1833 branches | 45.2% | 6 | 25% of branches |
| Accessor names that want to be a property | 7 in 1727 functions | 95.9% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1150, totalLines: 46366, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 59, totalFunctions: 1727, elseBlocks: 1, ifBlocks: 1833, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 7, measurementIsHeuristic: True |
| duplication | clones: 13, duplicatedLines: 111, totalLines: 43656, duplicatedPercentage: 0.25 |
| naming | bannedAbbreviationHits: 8, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 259, filesWithComments: 101, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 435, deeplyIndentedLines: 284, overlongLines: 78, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 50, literalComparisonLines: 251, measurementIsHeuristic: True |
| orphans | orphanFunctions: 0, functionsExamined: 1727 |
| designPatterns | roleFamilies: 66, predictedFiles: 77, predictedFilesMissing: 0, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 35, components: 238, orphanComponents: 0, averagePageLines: 37 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 80, limitedColumns: 0, writeDoors: 58, unvalidatedDoors: 58, looserLimits: 0 |
| fileAreas | totalFiles: 1383, frontend: 505, backend: 457, tooling: 105, shared: 98, api: 64, database: 60, tests: 40, docs: 40, infrastructure: 14 |

## Round 2 — Nothing uncalled, every pattern complete, no file over the limit

The round began on a green gate (the fresh reading scored 79.0% against the v3 baseline's 78.9%), so no baseline was adopted. The plan put one utility step first, four design-pattern steps after it, and the sweep behind those; the round took the first six in order. Every step moved or removed code without editing logic: no rendered output, event or refusal changed. After every step svelte-check held at its three pre-existing errors (the two public Supabase variables this environment lacks), the 155 tests passed and the gate held; the production build passes with placeholder values for those two variables. Pass 3 and Pass 4 are now empty: nothing in the repository is uncalled, every file the patterns predict exists or is an accepted gap, and no file is over the limit.

- **Remove the 32 components and functions nothing calls → 0 orphans, 42 files deleted**: every name was confirmed callerless across `src` before it went. The nine components were the payout details panel and form, the revenue share panel, the hive review panel and row, the brain dashboard's hive mind panel, sell panel and share list, the chat panel header, the face control bar and the reorderable row; the twenty-three functions included the payout and listing-sales readers, the account record parsers, the web search tool and its results reader, the client invite email, the staff gate, the hive status reader and application writer, the brain-question spend and refund, the knowledge-base bindings reader and the drag-reorder machinery with its edge scroller. Files those alone imported went with them (`accountRecord.ts`, `getListingSales.ts`, `getTradeTalkEarnings.ts`, `sellRequests.ts`, `shareGrouping.ts`, `listReorder.svelte.ts`, `findReorderRow.ts`, `edgeAutoScroller.ts`, `applyToHiveMind.ts`), and the hive application and membership types that only the deleted status reader used came off `hiveTypes.ts`. 1,436 lines gone.
- **Complete the pattern: every palette has a types → `src/lib/components/face/reliefTypes.ts`**: `ReliefSample` was declared inside `faceRelief.ts` and imported by `cubePlacements.ts`, and `ReliefCentre` sat beside the shape functions; both move to the relief's own types file, as the constellation, flow, region and hive palettes already keep theirs.
- **Complete the pattern: every `+page.server.ts` has a `+page.svelte` → seven accepted gaps**: `hive-mind`, `knowledge`, `knowledge/[...rest]`, `workspace` and `workspace/[entityId]` only forward old addresses to `/knowledge-base`, and `knowledge-base` sends the user to their most recent knowledge base; none draws anything. `brains/new` does have its page, as `+page@.svelte` resetting the layout; the audit reads that name as a different role, so the gap is recorded rather than a second page created.
- **Complete the pattern: every `+page.svelte` has a `+page.server.ts` → five accepted gaps**: the landing page, contact, privacy, terms and vision render fixed content from the data modules and the layout's session; nothing is loaded for them on the server.
- **brainTypes.ts 106 → four type modules**: `brainSourceTypes`, `brainModelTypes`, `brainEventTypes` and `brainConversationTypes`, each named for the one subject whose types it holds; the 77 importers take their types from the module that owns them. No type changed shape.
- **Conditions compared to a raw literal 271 → 251**: the six client requests that read 402, 400 and 403 off a response now compare against `HttpStatus` (`src/lib/data/httpStatus.ts`); the two tool calls that read `'max_tokens'` compare against `StopReason` on the Anthropic types; the interview's question archetypes and the usage summary's credit tallies become lookups keyed by their kind. This chunk is the seam the round stopped at — the rest of the element is the next round's.
- **Put back**: none; every step passed its checks at the first attempt.
- **Held**: else blocks 1, duplication 0.25%, inline hex colours 4, inline magic values 36, tangled conditions 50, overlong names 4, unvalidated doors 58 (never swept by a round). Improved: files over the limit 1 → 0, worst file 106 → 0, orphans 32 → 0, predicted files missing 13 → 0, functions over the limit 60 → 59, comment lines 263 → 259, long member chain lines 449 → 435, deeply indented lines 287 → 284, glued accessors 10 → 7, literal comparisons 278 → 251.
- **Division signature**: the file count fell 1,165 → 1,150 — 42 files deleted, six created (four type modules, `reliefTypes.ts`, `httpStatus.ts`), none over 30 lines. Duplication's 13 clone pairs are the same 13 as before; the deletions touched none of them. The banned-abbreviation count reads 8 where v3 read 6: the two new lines are in the same two test files the v3 report named (the reading settles as the total shrinks); it is not ratcheted and no abbreviation was introduced.
- **A kit reading to carry back**: the plan writer (`tools/refactor/audit/worklist/steps.py`) lists a pattern's unfiltered `missing` files, so the twelve accepted gaps still appear as the plan's steps 1 and 2 although the audit counts zero predicted files missing. The round left the kit's files alone; the fix belongs in the project-process kit, and the next round should read past those two steps.

## The journey so far

| Figure | v1 | v2 (adopted from drift) | v3 | v4 |
| --- | --- | --- | --- | --- |
| Code quality score | 76.9% | 78.9% | 78.9% | **83.3%** |
| Worst file (lines) | 109 | 109 | 106 | **0** |
| Average page length | 37 | 37 | 37 | **37** |
| Duplication % | not measured | 0.27 | 0.25 | **0.25** |
| Else blocks | 1 | 1 | 1 | **1** |
| Functions over the limit | 60 | 60 | 60 | **59** |
| Files over the limit | 2 | 2 | 1 | **0** |

## Worst files by length

| File | Lines |
| --- | --- |
| none over the limit | — |

## Next round, named

1. Conditions compared to a raw literal: 251 to zero — the string-literal union comparisons on `kind` and `status` in the flow layout, the upload resolution and the stage reply are the fullest files.
2. Long member chain lines: 435 to zero.
3. Deeply indented lines: 284 to zero.
4. Functions over the line limit: 59 to zero.
5. Explanatory comment lines: 259 to zero.

(The plan file's first two steps are the twelve accepted gaps the plan writer does not yet filter; the round after this one starts at its step 3.)

No file is over the limit now; the worst file by the audit's measure is 0 lines over, and the work left is the sweep.
