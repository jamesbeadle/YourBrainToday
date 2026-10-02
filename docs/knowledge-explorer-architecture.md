# The Knowledge Explorer — Architecture

How a person browses and finds what a knowledge base holds, beside the scene that shows
it spinning.

## One sentence

Every page, item and task across the four brains sits in one index with a search box,
filters and a reader for each, inside the dashboard, so finding a fact is a lookup and
not a question that costs credits.

## Why

The dashboard's 3D views show a brain's shape — and nothing else. Nothing took a search
query; the only way to find a fact was to ask the AI. A page's own links threw the
reader out of the knowledge base. An experience brain's items could not be opened at all.
The explorer is the plain view the scene always needed beside it.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Owner or viewer | one list of everything the knowledge base holds, filterable by brain and kind | I can see what is in it without flying into each brain |
| Owner or viewer | to type a few words and find every page and item that mentions them | a fact that no title names is still a lookup away |
| Owner or viewer | to open any page and see what links to it, what it links to, and what sits beside it | I move through the model the way the model is connected |
| Owner or viewer | to open an episode, a person or a connection in full, with its case file and its source | the experience and human brains are readable, not only drawn |
| Owner or viewer | the AI's citations, the log and a source's additions to open the same reader | every mention of a page leads to the page |

## The views

**Browse** (`/knowledge-base/{id}/browse`, the magnifying glass on the rail): a search
box, chips for each brain and each kind, sort by name or newest, and the flat index —
expertise pages with their context, items with an excerpt and date, process tasks with
their role. Typing filters the index; Enter, or "Search bodies", runs the full-text search
(`search_knowledge_base`, migration 0056) and shows the ranked hits with a snippet each.

**Page reader** (`/knowledge-base/{id}/brains/{brainId}/pages/{slug}`): breadcrumb,
kind, summary and body; then "Linked from", "Links to", "Also in {context}", and prev and
next by title. Links the modeller wrote as `/domain-brain/{slug}` open the reader; a bare
`/domain-brain/{slug}` link resolves to the first page of that slug the person may read.

**Item reader** (`/knowledge-base/{id}/brains/{brainId}/items/{itemId}`): the item in
full, its fields, where it came from, its case file and episodes, and for a connection the
two people.

**In the scene**: a region of the experience brain, clicked, lists its episodes as links;
the terminal's citations, the model index, the log and "What it added" on a source all
open the page reader.

## Data

Nothing new. The index is derived on load from the page index, the brain items and the
latest process maps; neighbours from the page links already parsed for the constellation.
The search is the Postgres function over `brain_pages` and `kb_brain_items`, running as
the signed-in person so row level security decides what they see.

## Files

```
src/routes/knowledge-base/[knowledgeBaseId=uuid]/browse/
src/routes/knowledge-base/[knowledgeBaseId=uuid]/brains/[brainId]/{pages/[slug],items/[itemId]}/
src/lib/server/knowledge/explorer/     loadKnowledgeIndex · loadPageReading · pageNeighbours · loadItemReading · itemRelations · findPageFiling
src/lib/components/knowledge/explorer/ ExplorerFrame · KnowledgeExplorer · PageReader · ItemReader · the lists, chips and search
src/lib/data/knowledge/{knowledgeIndex,knowledgeBaseRoutes}.ts
src/lib/server/search/searchKnowledgeBase.ts    src/routes/api/knowledge-base/[knowledgeBaseId=uuid]/search/
```
