# mimasu

**mimasu** is a frontend for [NewLeaf](https://sr.ht/~cadence/tube/), which in turn is a data extractor for Youtube. *NewLeaf is not part of the same project!*

## But why?

Alternative frontends for Youtube have been designed before. Unfortunately, frontends like [Invidious](https://invidious.io/) or [Piped](https://github.com/TeamPiped/Piped) are not always reliable, in part due to the fact that, since their instances are hosted on public servers, they are prone to fall under the weight of too much traffic or similar problems.

To work around this problem, one may try to install an instance of a Youtube frontend on the local computer. Unfortunately, when I tried to do that, I faced problems that are very complicated to solve. NewLeaf was easier to install, but its usual frontend [Cloudtube](https://sr.ht/~cadence/tube/) didn't quite compile. Therefore, I decided to write my own frontend for NewLeaf.

## Dependencies

- [NewLeaf](https://sr.ht/~cadence/tube/)
- [Bun](https://bun.sh)

## Install

```bash
git clone https://github.com/nmke-de/mimasu
```

## Run

1. Start NewLeaf with port 3000. (As of writing this, that's the default.)
2. `cd` into this directory, i.e. `cd mimasu`
3. Execute:
   ```bash
   bun run index.js
   ```

It may be advisable to encapsulate the above steps into a single shell script, in order to ease the use of **mimasu**.

## Other

This project was created using `bun init` in bun v1.0.15. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
