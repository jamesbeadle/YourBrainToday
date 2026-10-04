# Refactor audit

Generated 2026-10-04 19:52 UTC.

## Headline

**Code quality score 78.9%.** **1 of 1,165 source files are over the 100-line limit (0.1%)**; the worst file is 106 lines.

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

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 516 | 503 | 23,446 |
| backend | 468 | 468 | 16,319 |
| tooling | 104 | 0 | 0 |
| shared | 97 | 96 | 3,644 |
| api | 64 | 64 | 2,525 |
| database | 59 | 0 | 0 |
| docs | 38 | 0 | 0 |
| tests | 34 | 34 | 1,512 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,394** | **1,165** | **47,446** |

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

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 78.9% | 78.9% | — |
| fileLength.filesOverLimit | 2 | 1 | better |
| fileLength.worstFileLines | 109 | 106 | better |
| functionShape.functionsOverLimit | 60 | 60 | held |
| functionShape.elseBlocks | 1 | 1 | held |
| duplication.duplicatedPercentage | 0.27 | 0.25 | better |
| comments.explanatoryCommentLines | 263 | 263 | held |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 9 | 9 | held |
| orphans.orphanFunctions | 23 | 23 | held |
| prose.longMemberChainLines | 449 | 449 | held |
| prose.deeplyIndentedLines | 304 | 287 | better |
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
