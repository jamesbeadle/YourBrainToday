# Refactor audit

Generated 2026-10-09 15:28 UTC.

## Headline

**Code quality score 83.3%.** **0 of 1,150 source files are over the 100-line limit (0.0%)**; the worst file is 0 lines.

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

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 505 | 492 | 22,709 |
| backend | 457 | 457 | 16,004 |
| tooling | 105 | 0 | 0 |
| shared | 98 | 97 | 3,406 |
| api | 64 | 64 | 2,519 |
| database | 60 | 0 | 0 |
| tests | 40 | 40 | 1,728 |
| docs | 40 | 0 | 0 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,383** | **1,150** | **46,366** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 0, totalFiles: 1150, totalLines: 46366, worstFileLines: 0, worstFileTimesOverLimit: 0.0 |
| functionShape | limit: 30, functionsOverLimit: 59, totalFunctions: 1727, elseBlocks: 1, ifBlocks: 1833, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 7, measurementIsHeuristic: True |
| duplication | clones: 13, duplicatedLines: 111, totalLines: 43656, duplicatedPercentage: 0.25, carriedFromBaseline: True |
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

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 83.3% | 83.3% | — |
| fileLength.filesOverLimit | 0 | 0 | held |
| fileLength.worstFileLines | 0 | 0 | held |
| functionShape.functionsOverLimit | 59 | 59 | held |
| functionShape.elseBlocks | 1 | 1 | held |
| duplication.duplicatedPercentage | 0.25 | 0.25 | held |
| comments.explanatoryCommentLines | 259 | 259 | held |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 0 | 0 | held |
| orphans.orphanFunctions | 0 | 0 | held |
| prose.longMemberChainLines | 435 | 435 | held |
| prose.deeplyIndentedLines | 284 | 284 | held |
| functionNames.overlongFunctionNames | 4 | 4 | held |
| accessorNames.gluedAccessorNames | 7 | 7 | held |
| conditions.tangledConditionLines | 50 | 50 | held |
| conditions.literalComparisonLines | 251 | 251 | held |
| designPatterns.predictedFilesMissing | 0 | 0 | held |
| siteDefinition.handRolledElements | None | None | — |
| siteDefinition.boxedContentWidgets | None | None | — |
| inputValidation.unvalidatedDoors | 58 | 58 | held |
| inputValidation.looserLimits | 0 | 0 | held |

## Worst files by length

All files are within the limit.

Full detail, including every offender list, is in `audit.json`.
