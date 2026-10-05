# Feed your brain from Microsoft 365 through Claude

Your mail, your SharePoint documents and your Teams conversations hold most of what your
business knows and has done. Claude can read them for you and file what matters into your
knowledge base — with no Microsoft app of ours to approve and nothing new to install.
Claude carries two connectors at once: Anthropic's own Microsoft 365 connector reads, and
the Your Brain Today connector ([connect-claude.md](./connect-claude.md)) writes.

## What you need

- A Claude plan that offers connectors, on claude.ai or the Claude desktop app.
- A Microsoft 365 work account. The connector reaches what that account can see — your
  own mailbox, any shared mailbox you already have access to, the SharePoint sites and
  Teams you belong to.
- A Your Brain Today account that owns the knowledge base, with credits on it.

## Connect both

1. Connect Your Brain Today as a custom connector, as [connect-claude.md](./connect-claude.md)
   describes, and sign in.
2. In **Settings → Connectors**, find **Microsoft 365**, press **Connect**, sign in with
   your work account and accept the permissions it asks for. They let Claude read on your
   behalf; nothing is sent or changed unless you ask it to.
3. In a chat, switch both connectors on in the tools menu.

## Check it works

- *"What can you reach in my Microsoft 365?"* — Claude reports who you are signed in as
  and the permissions it holds.
- *"Which knowledge bases do I own?"* — Claude lists them from Your Brain Today.

## What to say to it

Claude searches, reads, and then sends each coherent piece in with a title, exactly as if
you had uploaded it. Ask for one subject at a time and say where it goes:

- *"Search my mailbox for everything about the Harrow extension since March, and file
  each thread into the Jewel knowledge base."*
- *"Read the Handover folder on the Projects SharePoint site and file each document."*
- *"Read last month's posts in the Site Managers channel and file the decisions taken."*
- *"Go through my calendar for last quarter and file a note of who we met and why."*

Ask it to tell you what it filed. Every piece appears in the knowledge base's **Ingested
data** panel labelled *Sent over MCP*, and the four brains learn from it as they do from a
document: the expertise model updates, and the experience, process and human brains take
what applies to them.

## What it costs

Reading in Microsoft 365 costs nothing in Your Brain Today. Each piece filed costs what an
upload of that size costs. A mailbox holds thousands of threads, so name a subject and a
date range rather than asking for everything.

## If Microsoft asks for approval

Some organisations let only an administrator approve new apps, and Microsoft then shows
**Need admin approval** when you connect. The app is Anthropic's Microsoft 365 connector,
not ours, and your administrator approves it once for everyone in the Entra admin centre
under Enterprise applications; then connect again. To stop, remove the connector in
Claude's settings.

## What stays manual

This route is driven by a person in a conversation. Nothing syncs on its own, an attachment
is read only as the text Claude draws from it, and a mailbox is fed thread by thread.
Everything that goes in is recorded in the knowledge base's log as asked over MCP. If
feeding the brain from Microsoft 365 becomes a daily way of working, the next step is a
connection inside the site that reads chosen folders and sites continuously.
