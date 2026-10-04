# Refactor audit

Generated 2026-10-04 17:50 UTC.

## Headline

**Code quality score 76.9%.** **2 of 1,124 source files are over the 100-line limit (0.2%)**; the worst file is 109 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **91.0%** | **52** | |
| Files over the line limit | 2 in 1124 files | 99.6% | 10 | 50% of files |
| Worst file, in limits over | 0.09 | 99.0% | 5 | 9 |
| Functions over the line limit | 60 in 1748 functions | 86.3% | 8 | 25% of functions |
| Else blocks | 1 in 1888 branches | 99.9% | 5 | 50% of branches |
| Duplication % | not measured | not measured | — | 20 |
| Explanatory comment lines | 264 in 46.45 thousand lines | 88.6% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 46.45 thousand lines | 96.1% | 4 | 20 per thousand lines |
| Orphan components and functions | 32 in 1995 components and functions | 84.0% | 4 | 10% of components and functions |
| Long member chain lines | 443 in 46.45 thousand lines | 68.2% | 4 | 30 per thousand lines |
| Deeply indented lines | 304 in 46.45 thousand lines | 78.2% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1748 functions | 97.7% | 4 | 10% of functions |
| **Design pattern file count** | | **66.2%** | **10** | |
| Files the patterns predict but are missing | 13 in 77 predicted files | 66.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **76.4%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1888 branches | 89.4% | 8 | 25% of branches |
| Conditions compared to a raw literal | 278 in 1888 branches | 41.1% | 6 | 25% of branches |
| Accessor names that want to be a property | 10 in 1748 functions | 94.3% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 510 | 497 | 23,410 |
| backend | 444 | 444 | 15,644 |
| shared | 92 | 91 | 3,547 |
| api | 64 | 64 | 2,573 |
| database | 58 | 0 | 0 |
| tests | 28 | 28 | 1,280 |
| docs | 27 | 0 | 0 |
| tooling | 20 | 0 | 0 |
| infrastructure | 13 | 0 | 0 |
| **whole repository** | **1,256** | **1,124** | **46,454** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 2, totalFiles: 1124, totalLines: 46454, worstFileLines: 109, worstFileTimesOverLimit: 0.09 |
| functionShape | limit: 30, functionsOverLimit: 60, totalFunctions: 1748, elseBlocks: 1, ifBlocks: 1888, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 10, measurementIsHeuristic: True |
| duplication | skipped: jscpd is not installed (npm install -g jscpd) |
| naming | bannedAbbreviationHits: 3, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 264, filesWithComments: 103, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 443, deeplyIndentedLines: 304, overlongLines: 77, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 50, literalComparisonLines: 278, measurementIsHeuristic: True |
| orphans | orphanFunctions: 23, functionsExamined: 1748 |
| designPatterns | roleFamilies: 64, predictedFiles: 77, predictedFilesMissing: 13, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 35, components: 247, orphanComponents: 9, averagePageLines: 37 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 80, limitedColumns: 0, writeDoors: 58, unvalidatedDoors: 58, looserLimits: 0 |
| fileAreas | totalFiles: 1256, frontend: 510, backend: 444, shared: 92, api: 64, database: 58, tests: 28, docs: 27, tooling: 20, infrastructure: 13 |

## Against the baseline

No `baseline.json` beside the audit — nothing to ratchet against.

## Worst files by length

| File | Lines |
| --- | --- |
| src/lib/components/account/PayoutDetailsPanel.svelte | 109 |
| src/lib/data/brainTypes.ts | 106 |

Full detail, including every offender list, is in `audit.json`.
