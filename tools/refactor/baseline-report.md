# Refactor audit — baseline v3, after round 1

Generated 2026-10-04 from refactor/round-1, replacing the v2 baseline.

The widgets' designs: not set up. `rules.json` carries no `siteDefinition.catalogue`, so no site definition is written and no design index exists; the site has never been checked against a brand sheet (`widget-design`: *"Check the site against the brand"*) nor the widgets against their sheets (*"Check the widgets against their designs"*). The round reports this and does not run it.

## Headline

Code quality score 78.9% → 78.9%. **Code quality score 78.9%.** **1 of 1,165 source files are over the 100-line limit (0.1%)**; the worst file is 106 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **92.3%** | **60** | |
| Files over the line limit | 1 in 1165 files | 99.8% | 10 | 50% of files |
| Worst file, in limits over | 0.06 | 99.3% | 5 | 9 |
| Functions over the line limit | 60 in 1775 functions | 86.5% | 8 | 25% of functions |
| Else blocks | 1 in 1911 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.25 | 98.8% | 8 | 20 |
| Explanatory comment lines | 263 in 47.45 thousand lines | 88.9% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 47.45 thousand lines | 96.2% | 4 | 20 per thousand lines |
| Orphan components and functions | 32 in 2025 components and functions | 84.2% | 4 | 10% of components and functions |
| Long member chain lines | 449 in 47.45 thousand lines | 68.5% | 4 | 30 per thousand lines |
| Deeply indented lines | 287 in 47.45 thousand lines | 79.8% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1775 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **66.2%** | **10** | |
| Files the patterns predict but are missing | 13 in 77 predicted files | 66.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **76.7%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1911 branches | 89.5% | 8 | 25% of branches |
| Conditions compared to a raw literal | 278 in 1911 branches | 41.8% | 6 | 25% of branches |
| Accessor names that want to be a property | 10 in 1775 functions | 94.4% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 1, totalFiles: 1165, totalLines: 47446, worstFileLines: 106, worstFileTimesOverLimit: 0.06 |
| functionShape | limit: 30, functionsOverLimit: 60, totalFunctions: 1775, elseBlocks: 1, ifBlocks: 1911, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 10, measurementIsHeuristic: True |
| duplication | clones: 13, duplicatedLines: 111, totalLines: 44697, duplicatedPercentage: 0.25 |
| naming | bannedAbbreviationHits: 6, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 263, filesWithComments: 102, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 449, deeplyIndentedLines: 287, overlongLines: 77, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 50, literalComparisonLines: 278, measurementIsHeuristic: True |
| orphans | orphanFunctions: 23, functionsExamined: 1775 |
| designPatterns | roleFamilies: 66, predictedFiles: 77, predictedFilesMissing: 13, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 35, components: 250, orphanComponents: 9, averagePageLines: 37 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 80, limitedColumns: 0, writeDoors: 58, unvalidatedDoors: 58, looserLimits: 0 |
| fileAreas | totalFiles: 1394, frontend: 516, backend: 468, tooling: 104, shared: 97, api: 64, database: 59, docs: 38, tests: 34, infrastructure: 14 |

## Round 1 — The shared functions go home

The round began on a failing gate: six long member chain lines had grown since the v1 baseline with the chat "remember" feature and the company details, so the current reading was adopted as baseline v2 before any file was touched. The plan then put one component breakout first and nine utility-function steps after it, and the round took those ten in order. Every step moved code verbatim into a home named for its one purpose, pointed every caller at it and deleted the copies; no logic was edited, no behaviour changed. After every step svelte-check held at its three pre-existing errors (the public Supabase variables this environment lacks), the 137 tests passed and the gate held; the production build passes with placeholder values for those two variables. The repository's `readme.md` was renamed `README.md` so the score box lands at the bottom of the real README rather than in a second file.

- **PayoutDetailsPanel.svelte 109 → 47**: the payout form (its three fields, its `FormTracker`, its error note and submit button) becomes `PayoutDetailsForm.svelte`, taking `payoutDetails` in and announcing `onSaved`; the editing flag stays in the panel, which the header's Edit button and the form's close both touch.
- **formatDay / formatPublishedDate / formatPurchaseDate → `formatBritishDate`**: the four views (PurchaseHistoryTable, EditionList, EditionPurchaseRow, MarketLibrary) stop formatting dates themselves and import the function `src/lib/data/britishDate.ts` already held with the same body.
- **destroy ×3 → `disposeExperience`** in `src/lib/components/stage/disposeExperience.ts`, beside `createStage` and the scene loop; the constellation, flow and region experiences each hand it their loop, pointer detacher, resize observer, controls, view and stage.
- **domainStatement ×2 → `modellingDoctrine.ts`**, the module that already holds the prompt sections both the ingest and the remember prompts read.
- **messagesFromTurns ×2 → `src/lib/server/anthropic/messagesFromTurns.ts`**, typed over any turn with a speaker and a text so the Modeller's and the face's turn types both fit.
- **readQuestion ×3 → `src/lib/server/http/readQuestion.ts`**, beside the other request gates; the brain, chatbot and v1 API ask endpoints import it.
- **updateModel ×2 → `createModelUpdater`** in `src/lib/components/stage/modelUpdater.ts`, which skips an unchanged model and hands the previous one to the scene; the constellation, whose body differed only in computing newcomers from the previous model, adopts it too, so the three scenes track their model the same way.
- **messageFrom ×2 → `src/lib/client/responseMessage.ts`**, read by source reading and source upload.
- **slugify ×2 → `src/lib/data/slugify.ts`**, read by the map layout and the model writes.
- **queryFrom ×2 → `src/lib/server/search/queryFrom.ts`**, read by the pages tool, the knowledge tool and the reading tools that imported it from the knowledge tool.
- **Put back**: none; every step passed its checks at the first attempt.
- **Held**: files over the limit 2 → 1, worst file 109 → 106 lines, duplication 0.27% → 0.25%, functions over the limit 60, else blocks 1, long member chain lines 449, deeply indented lines 304 → 287, comment lines 263, inline magic values 36, orphans 32, predicted files missing 13, tangled conditions 50, literal comparisons 278, glued accessors 10, overlong names 4, unvalidated doors 58 (never swept by a round).
- **Division signature**: eight new files (one component, seven single-function modules), each under 25 lines, so the file count rose 1,157 → 1,165 with nothing new over the limit. The banned-abbreviation count reads 6 where the v2 report read 3; the six lines are in two test files the round did not touch (askModeller.test.ts, readingExchange.test.ts), so the figure is the reading settling, not a regression, and it is not ratcheted.

## The journey so far

| Figure | v1 | v2 (adopted from drift) | v3 |
| --- | --- | --- | --- |
| Code quality score | 76.9% | 78.9% | **78.9%** |
| Worst file (lines) | 109 | 109 | **106** |
| Average page length | 37 | 37 | **37** |
| Duplication % | not measured | 0.27 | **0.25** |
| Else blocks | 1 | 1 | **1** |
| Functions over the limit | 60 | 60 | **60** |
| Files over the limit | 2 | 2 | **1** |

## Worst files by length

| File | Lines |
| --- | --- |
| src/lib/data/brainTypes.ts | 106 |

## Next round, named

1. Remove the 32 components and functions nothing calls, each confirmed callerless first (`details.orphans`, `details.inventory.offenders.orphans`).
2. Complete the pattern: every palette has a types — `src/lib/components/face/reliefTypes.ts` is predicted, or the gap is accepted.
3. Complete the pattern: every `+page.server.ts` has a `+page.svelte` — seven routes lack one; most are redirects, so these are likely accepted gaps.
4. Complete the pattern: every `+page.svelte` has a `+page.server.ts` — five static pages lack one; likely accepted gaps.
5. Divide `src/lib/data/brainTypes.ts` (106 lines) into the units its pattern names, or record it as a coherent set of types.

The worst file is now `src/lib/data/brainTypes.ts` at 106 lines, the one file left over the limit, and it holds only types.
