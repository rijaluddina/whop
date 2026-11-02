# frontend-reference-hunt

[![skills.sh](https://skills.sh/b/LucasSantana-Dev/frontend-reference-hunt)](https://skills.sh/LucasSantana-Dev/frontend-reference-hunt)

Finds real visual references before you build, and maps them into a structured board instead of a pile of links. Pulls from Dribbble, Mobbin, Pinterest, and curated galleries (Awwwards, Godly, Land-book, siteinspire), then extracts register, typography, palette, spacing, layout, and named motion archetypes, with explicit steal/avoid notes per reference.

Works with Claude Code and any agent supporting [`npx skills`](https://github.com/vercel-labs/skills).

## Install

```bash
npx skills add LucasSantana-Dev/frontend-reference-hunt
```

That copies `SKILL.md` + `references/` into your agent's skills directory (`.claude/skills/` or `.agents/skills/`). Update later with `npx skills update`.

## Use

Ask for references in either language: "find design references for a pricing page", "reference hunt", "moodboard pra essa página", "procura no Dribbble/Mobbin", "referências de motion".

It also feeds the reference-anchor phase of a build skill like [repaint](https://github.com/LucasSantana-Dev/repaint), so the anchor comes from current real-world work rather than training-data recall.

## Why a board and not a link dump

The output is a board with two or three named **directions** (say "quiet editorial" vs "kinetic brutalist"), each backed by concrete references. Every reference carries what to take and what to leave, because "this looks nice" does not survive contact with implementation. Motion gets named archetypes rather than adjectives, so the build step has something to aim at.

`references/platform-playbook.md` routes by goal: which platform actually answers which question, plus a query-widening ladder for when a search returns fewer than five usable references. `references/reference-board-template.md` is the output shape.

## Scope

Searches and maps. It does not build UI. Hand the board to a build skill for that.

## Licence

Apache-2.0
