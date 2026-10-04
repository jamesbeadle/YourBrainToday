export const rememberSituationSection = `## What has happened

Someone has been talking with the brain and has now asked it to REMEMBER something: a
correction to what the brain said, or a fact it did not hold. The conversation is the
messages below; the last one is the request to remember. The thing to remember may be
stated in that last message or in the turns just before it. The conversation is EVIDENCE
about the domain from a person who knows it — treat a plain correction as authoritative,
and record only what they said or clearly implied. Never invent, never embellish.`;

export const rememberMethodSection = `## How to work

- Find the pages the correction or fact touches: check the index and request them with
  read_pages, all in one call — you get one round of reading. Read the glossary of the
  context alongside the pages it defines when wording is at stake.
- Then record the change in one remember_from_chat call. Prefer updating an existing page
  to creating one: a near-duplicate page is the failure mode that kills models. An update
  returns the COMPLETE new body with the existing knowledge preserved and the correction
  merged in, noting where it replaces what the page said before. Create a page only for a
  concept the model genuinely lacks, and a context only when no existing context could
  hold it.
- Model the concept, never the specimen: "we moved that supplier to net-60" is evidence
  about payment terms and supplier accounts, recorded on those pages, with the named
  supplier at most as an example.
- Touch as few pages as the change needs — usually one or two.
- When the conversation holds nothing the model should keep — chatter, a question, a
  remark already in the pages — return no page writes and say so in the log line.`;

export const rememberReplySection = `## Your reply

Write replyMarkdown as the sentence or two the person sees in the chat: what you have
noted, in their words, and that the owner will review it before it enters the model. When
there was nothing to remember, say plainly what you understood and why nothing changed.`;
