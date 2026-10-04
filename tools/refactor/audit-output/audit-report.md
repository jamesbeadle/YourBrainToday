# Refactor audit

Generated 2026-10-04 19:42 UTC.

## Headline

**Code quality score 78.9%.** **2 of 1,157 source files are over the 100-line limit (0.2%)**; the worst file is 109 lines.

## Code quality score

| Element | Reading | Score | Weight | 0% at |
| --- | --- | --- | --- | --- |
| **Standard baseline checks** | | **92.2%** | **60** | |
| Files over the line limit | 2 in 1157 files | 99.7% | 10 | 50% of files |
| Worst file, in limits over | 0.09 | 99.0% | 5 | 9 |
| Functions over the line limit | 60 in 1790 functions | 86.6% | 8 | 25% of functions |
| Else blocks | 1 in 1919 branches | 99.9% | 5 | 50% of branches |
| Duplication % | 0.27 | 98.7% | 8 | 20 |
| Explanatory comment lines | 263 in 47.48 thousand lines | 88.9% | 4 | 50 per thousand lines |
| Inline magic values | 36 in 47.48 thousand lines | 96.2% | 4 | 20 per thousand lines |
| Orphan components and functions | 32 in 2039 components and functions | 84.3% | 4 | 10% of components and functions |
| Long member chain lines | 449 in 47.48 thousand lines | 68.5% | 4 | 30 per thousand lines |
| Deeply indented lines | 304 in 47.48 thousand lines | 78.7% | 4 | 30 per thousand lines |
| Overlong function names | 4 in 1790 functions | 97.8% | 4 | 10% of functions |
| **Design pattern file count** | | **66.2%** | **10** | |
| Files the patterns predict but are missing | 13 in 77 predicted files | 66.2% | 10 | 50% of predicted files |
| Entities outside their expected file count | not measured | not measured | — | 50% of entities |
| **Prose** | | **76.8%** | **20** | |
| Conditions with calls tangled inside calls | 50 in 1919 branches | 89.6% | 8 | 25% of branches |
| Conditions compared to a raw literal | 278 in 1919 branches | 42.1% | 6 | 25% of branches |
| Accessor names that want to be a property | 10 in 1790 functions | 94.4% | 6 | 10% of functions |
| **Widget adoption** | | **not measured** | **0** | |
| Markup written by hand where a widget should be | not measured | not measured | — | 50% of widget slots |
| **Input validation** | | **0.0%** | **8** | |
| Doors that write without checking their input against the columns | 58 in 58 write doors | 0.0% | 8 | 50% of write doors |

Each element scores 100% with no offenders and falls in a straight line to 0% when its offenders, measured against the size of the codebase, reach the figure in the last column. The score is the weighted average of the elements that could be measured; an element that could not be measured lends its weight to the rest. Weights and zero points are set in `tools/refactor/rules.json` under `score.elements`. The offenders behind every reading are in `tools/refactor/audit-output/audit.json`.

## The repository by area

| Area | Files | Of which audited source | Source lines |
| --- | --- | --- | --- |
| frontend | 513 | 500 | 23,461 |
| backend | 465 | 465 | 16,333 |
| tooling | 104 | 0 | 0 |
| shared | 95 | 94 | 3,635 |
| api | 64 | 64 | 2,543 |
| database | 59 | 0 | 0 |
| docs | 38 | 0 | 0 |
| tests | 34 | 34 | 1,512 |
| infrastructure | 14 | 0 | 0 |
| **whole repository** | **1,386** | **1,157** | **47,484** |

## Summary

| Check | Key figures |
| --- | --- |
| fileLength | limit: 100, filesOverLimit: 2, totalFiles: 1157, totalLines: 47484, worstFileLines: 109, worstFileTimesOverLimit: 0.09 |
| functionShape | limit: 30, functionsOverLimit: 60, totalFunctions: 1790, elseBlocks: 1, ifBlocks: 1919, measurementIsHeuristic: True |
| functionNames | overlongFunctionNames: 4, maxWords: 5, maxLength: 40 |
| accessorNames | gluedAccessorNames: 10, measurementIsHeuristic: True |
| duplication | clones: 14, duplicatedLines: 122, totalLines: 44960, duplicatedPercentage: 0.27 |
| naming | bannedAbbreviationHits: 6, unprefixedBooleans: 2 |
| comments | explanatoryCommentLines: 263, filesWithComments: 102, taskMarkers: 0 |
| magicValues | inlineHexColours: 4, inlineStyleAttributes: 2, repeatedStringLiterals: 30 |
| prose | longMemberChainLines: 449, deeplyIndentedLines: 304, overlongLines: 77, measurementIsHeuristic: True |
| conditions | tangledConditionLines: 50, literalComparisonLines: 278, measurementIsHeuristic: True |
| orphans | orphanFunctions: 23, functionsExamined: 1790 |
| designPatterns | roleFamilies: 66, predictedFiles: 77, predictedFilesMissing: 13, entities: 0, entitiesOutOfRange: 0, measurementIsHeuristic: True |
| inventory | pages: 35, components: 249, orphanComponents: 9, averagePageLines: 37 |
| siteDefinition | skipped: no siteDefinition catalogue in rules.json |
| inputValidation | schemaTables: 80, limitedColumns: 0, writeDoors: 58, unvalidatedDoors: 58, looserLimits: 0 |
| fileAreas | totalFiles: 1386, frontend: 513, backend: 465, tooling: 104, shared: 95, api: 64, database: 59, docs: 38, tests: 34, infrastructure: 14 |

## Against the baseline

| Ratcheted figure | Baseline | Now | Verdict |
| --- | --- | --- | --- |
| code quality score | 76.9% | 78.9% | — |
| fileLength.filesOverLimit | 2 | 2 | held |
| fileLength.worstFileLines | 109 | 109 | held |
| functionShape.functionsOverLimit | 60 | 60 | held |
| functionShape.elseBlocks | 1 | 1 | held |
| duplication.duplicatedPercentage | None | 0.27 | — |
| comments.explanatoryCommentLines | 264 | 263 | better |
| magicValues.inlineHexColours | 4 | 4 | held |
| inventory.orphanComponents | 9 | 9 | held |
| orphans.orphanFunctions | 23 | 23 | held |
| prose.longMemberChainLines | 443 | 449 | worse |
| prose.deeplyIndentedLines | 304 | 304 | held |
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
| src/lib/components/account/PayoutDetailsPanel.svelte | 109 |
| src/lib/data/brainTypes.ts | 106 |

Full detail, including every offender list, is in `audit.json`.
