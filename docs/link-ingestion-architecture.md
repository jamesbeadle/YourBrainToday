# Reading a Link — Architecture

How a pasted link — a GitHub repository, an X account or post, or any web page — becomes a
source the brain reads exactly as it reads an uploaded document.

## The stories it serves

| As | I want | So that |
| --- | --- | --- |
| Owner | to paste a link to a GitHub repository and have the brain read its readme, docs and code | the logic I already wrote is context the brain can draw on |
| Owner | to paste a link to a folder or a file in a repository | I can feed it one part without the rest |
| Owner | to paste an X profile or post | what I have said in public is in the brain too |
| Owner | to paste any other page | an article, a help page or a wiki entry is one gesture away |
| Owner | a link that cannot be read to say why | I know whether to try again, sign in, or give up |

## The view

The Sources panel (`SourcesPanel`) opens with the quick capture box
(`SourceCapturePanel`): one box for whatever the owner was just sent. It recognises what
was pasted (`recogniseCapture`): a link on its own is read by the server; anything else —
a post copied out of X, a forwarded message, a dictated note — is kept word for word as a
note, so a page that refuses to be fetched still teaches the brain; a screenshot pasted
into it is read as an image through the document path. The button says which it will do,
Enter sends a link and Ctrl or Cmd with Enter sends a note. The capture joins the same
queue as documents (`SourceUploadQueue`), shows "reading the link…" while the server
fetches it, then the four reading stages like any other source, and settles with the same
success or failure line. The source appears in the list under the title the reader gave
it — `acme/ledger (GitHub)`, `@someone on X`, or the page's title — or, for a note, its
first line.

## The flow

```
browser  POST /api/brain/sources/link {brainId, url}
server   parseLinkUrl ─▶ recogniseLink ─▶ one reader ─▶ {title, text}
         createBrainSource (text/markdown) ─▶ store the text ─▶ {sourceId}
browser  POST /api/brain/sources/{id}/read   once per stage, as for any upload
```

`recogniseLink` (`linkTargets.ts`) says what the link is from its host and path alone, so
it is tested without the network. Every reader puts `Source link: {url}` at the top of the
text, so the provenance travels with the knowledge into the harvests.

**A GitHub repository** (`readGitHubRepository`): two calls to the GitHub API — the
repository's facts and its full tree — then the files are chosen (`chooseRepositoryFiles`)
in the order a newcomer would read them: readme, then docs, then code nearest the root,
then configuration. Dependencies, builds, lockfiles, binaries, minified bundles and files
over 120KB are left unread. Each file is capped at 24,000 characters and the whole at
200,000, the same ceiling the modeller reads a document to. The chosen files are fetched
raw, eight at a time, and rendered as one markdown document (`renderRepositoryDocument`):
the facts, how much was read, the list of files, then each file fenced by its extension.
A `/tree/{branch}/{folder}` link reads that folder; a `/blob/{branch}/{path}` link reads
that one file (`readGitHubFile`).

Set `GITHUB_TOKEN` to read private repositories and to lift GitHub's unauthenticated
rate limit; without it, public repositories are read at sixty API calls an hour per host.

**An X post** (`readXPost`) is read through the public FixTweet API, which needs no X
account: the author, their bio, the post, what it replied to and what it quoted.
**An X profile** (`readXProfile`) reads the embedded-timeline page X serves for its own
profile widgets, which carries the recent posts as JSON; when X withholds them, the bio
comes from FixTweet and the text says the posts were not readable.

**Any other page** (`fetchLinkedPage`) is fetched and reduced to its text, with scripts,
navigation and footers stripped (`htmlToPlainText`).

## Limits

Only http and https, never our own private hosts (`parseLinkUrl`). A link that becomes
more text than a text upload may hold is refused with the upload limits, before any credit
is reserved. Reading a link is one request with a two-minute ceiling; the reading stages
that follow are the ordinary ones.

## Files

```
src/lib/server/brain/links/
  linkUrl.ts               the link, checked              linkTargets.ts          what the link points at
  readLinkedSource.ts      the dispatcher                 linkLimits.ts           the ceilings
  fetchLinkedPage.ts       any page as text
  github/  githubRequest · repositoryFileRules · chooseRepositoryFiles · renderRepositoryDocument
           readGitHubRepository · readGitHubFile
  x/       xRequest · renderXPosts · readXPost · readXProfile
src/routes/api/brain/sources/link/+server.ts
src/lib/components/brain/{SourceCapturePanel.svelte, captureKind.ts, addLinkedSource.ts, queuedUpload.ts}
```
