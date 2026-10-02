# The Benchmark — documents against brains

A measured answer to one question: does a clean model given the four brains answer better
than the same model given the raw source documents and left to work it out?

## What it measures

`scripts/benchmark/` asks every question in a questions file through each **arm**, on the
same model, with the same `max_tokens` and the same answer tool (`answerMarkdown`,
`citedSources`), then has a judge score each answer against a gold answer.

| Arm | What the model is given | How it answers |
| --- | --- | --- |
| `documents` | every ingested `brain_sources` file of the knowledge base's expertise brains, downloaded and placed in one user message with the question, under a character budget | one call; "answer from these documents only; cite the filenames" |
| `brains` | the orchestrator exactly as the MCP and API doors run it (`askKnowledgeBase`) — the expertise index, the experience, process and human brains, the search and read tools | up to three reading rounds, then the answer; no billing, no record |
| `brains-self` (optional) | the free MCP reads a connected Claude gets — the description, the index, the three printed brains — plus `search_knowledge` and `read_pages`, with a plain prompt instead of the orchestrator's | the same loop, so this is the self-orchestration path |

The judge (the answering model unless `--judge-model` names another) scores through a tool:
**correctness** 0–2, **completeness** 0–2, **groundedness** 0–2 (does the answer assert
things the gold answer and notes do not support) and a one-line reason. Beside the scores
every run records the context characters shown, the input and output tokens summed over
every call the arm made (`meteredCallsSoFar`), the latency, the pages read, and whether the
arm fell back to "I could not put an answer together" — a fallback scores 0 on every axis
without troubling the judge.

The report is `scripts/benchmark/results/<timestamp>.md` — a summary table per arm (means),
a table of every run — with the raw JSON beside it; the summary is also printed. The
results folder is ignored by git.

## How to run it

```bash
npm run benchmark -- --knowledge-base <uuid> --questions scripts/benchmark/questions.example.json \
  [--model claude-sonnet-5] [--judge-model <id>] [--repeats 2] [--arms documents,brains,brains-self] \
  [--document-budget 2000000]
```

`npm run benchmark -- --help` prints the options. The script runs the app's own server code
through `jiti` (`scripts/benchmark/benchmark.mjs` points `$lib` and the `$env` aliases at
plain files under `shims/`) and reads `.env` itself, so it needs `ANTHROPIC_API_KEY`,
`SUPABASE_SECRET_KEY` and `PUBLIC_SUPABASE_URL` and fails plainly without them. It uses the
service-role client and the readers in `src/lib/server/knowledge/reading`; it never writes
to `brain_events` or the credit ledger.

A questions file is a JSON array of
`{ "id", "question", "goldAnswer", "brain": "expertise|experience|process|human|cross", "notes"? }`.
`questions.example.json` holds six placeholders for a construction business; replace every
gold answer with what your documents and interviews actually say.

## Honesty caveats — read before quoting a number

- **The brains know more than the documents.** A knowledge base built by interview holds
  knowledge no document states; the `documents` arm cannot score on those questions. Tag
  questions by `brain` and compare the arms on the questions the documents could answer
  separately from the ones only the interview could.
- **Context sizes differ.** The documents arm sees every file at once; the brains arm sees a
  bounded rendering and reads pages on demand. Over the `--document-budget` text is cut
  evenly and the report says so; PDFs and images cannot be cut. A documents arm that was
  truncated is not a fair loser.
- **The judge is a model.** Its scores drift with wording; use a different judge model from the
  answering one where you can, run `--repeats 2` or more, and read the reasons, not only
  the means.
- **Repeats matter.** One pass of six questions is an anecdote. The summary means over
  questions × repeats; look at the spread in the per-run table before claiming a gap.
- **A fair question set** is written from the documents *and* the interviews, with gold answers
  a person checked; it mixes the four brains and a cross-brain question; it includes at least
  one question the knowledge base cannot answer, so groundedness rewards an honest "not
  known"; and it never reuses the orchestrator's own answers as gold.
- **Cost is real.** Every run spends on the Anthropic key in `.env`; the documents arm sends
  the whole corpus on every question.
