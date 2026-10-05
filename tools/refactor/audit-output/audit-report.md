# Refactor audit

Generated 2026-10-05 10:44 UTC.

## Headline

**Code quality score 79.0%.** **1 of 1,174 source files are over the 100-line limit (0.1%)**; the worst file is 106 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **92.4%** | **60** | |
| Files over the line limit | 1 in 1174 files | 99.8% | 10 | 50% of files |
| Worst file, in limits over | 0.06 | 99.3% | 5 | 9 |
| Functions over the line limit | 59 in 1782 functions | 86.8% | 8 | 25% of functions |
| Else blocks | 1 in 1915 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.25 | 98.8% | 8 | 20 |
| Explanatory comment lines | 260 in 47.66 thousand lines | 89.1% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 47.66 thousand lines | 96.2% | 4 | 20 per thousand lines |
| Orphan components and functions | 32 in 2033 components and functions | 84.3% | 4 | 10% of components and functions |
| Long member chain lines | 449 in 47.66 thousand lines | 68.6% | 4 | 30 per thousand lines |
| Deeply indented lines | 287 in 47.66 thousand lines | 79.9% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1782 functions | 97.8% | 4 | 10% of functions |
| **Design pattern file count** | | **66.2%** | **10** | |
| Files the patterns predict but are missing | 13 in 77 predicted files | 66.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **76.7%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1915 branches | 89.6% | 8 | 25% of branches |
| Conditions compared to a raw literal | 278 in 1915 branches | 41.9% | 6 | 25% of branches |
| Accessor names that want to be a property | 10 in 1782 functions | 94.4% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 518 | 505 | 23,471 |
| backend | 470 | 471 | 16,374 |
| tooling | 105 | 0 | 0 |
| shared | 97 | 96 | 3,637 |
| api | 64 | 64 | 2,525 |
| database | 59 | 0 | 0 |
| docs | 40 | 0 | 0 |
| tests | 38 | 38 | 1,649 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,405** | **1,174** | **47,656** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 1, totalFiles: 1174, totalLines: 47656, worstFileLines: 106, worstFileTimesOverLimit: 0.06 |
| functionShape | limit: 30, functionsOverLimit: 59, totalFunctions: 1782, elseBlocks: 1, ifBlocks: 1915, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 10, measurementIsHeuristic: True |
| duplication | clones: 13, duplicatedLines: 111, totalLines: 44697, duplicatedPercentage: 0.25, carriedFromBaseline: True |
| naming | bannedAbbreviationHits: 6, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 260, filesWithComments: 102, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 449, deeplyIndentedLines: 287, overlongLines: 78, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 50, literalComparisonLines: 278, measurementIsHeuristic: True |
| orphans | orphanFunctions: 23, functionsExamined: 1782 |
| designPatterns | roleFamilies: 67, predictedFiles: 77, predictedFilesMissing: 13, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 35, components: 251, orphanComponents: 9, averagePageLines: 37 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 80, limitedColumns: 0, writeDoors: 58, unvalidatedDoors: 58, looserLimits: 0 |
| fileAreas | totalFiles: 1405, frontend: 518, backend: 470, tooling: 105, shared: 97, api: 64, database: 59, docs: 40, tests: 38, infrastructure: 14 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 78.9% | 79.0% | — |
| fileLength.filesOverLimit | 1 | 1 | held |
| fileLength.worstFileLines | 106 | 106 | held |
| functionShape.functionsOverLimit | 60 | 59 | better |
| functionShape.elseBlocks | 1 | 1 | held |
| duplication.duplicatedPercentage | 0.25 | 0.25 | held |
| comments.explanatoryCommentLines | 263 | 260 | better |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 9 | 9 | held |
| orphans.orphanFunctions | 23 | 23 | held |
| prose.longMemberChainLines | 449 | 449 | held |
| prose.deeplyIndentedLines | 287 | 287 | held |
| functionNames.overlongFunctionNames | 4 | 4 | held |
| accessorNames.gluedAccessorNames | 10 | 10 | held |
| conditions.tangledConditionLines | 50 | 50 | held |
| conditions.literalComparisonLines | 278 | 278 | held |
| designPatterns.predictedFilesMissing | 13 | 13 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 58 | 58 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

| File | Lines |
| --- | --- |
| src/lib/data/brainTypes.ts | 106 |

Full detail, including every offender list, is in `audit.json`.
