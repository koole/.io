# koole.io

[![Netlify Status](https://api.netlify.com/api/v1/badges/53c4250f-6710-4ec3-a45a-742777aa5d10/deploy-status)](https://app.netlify.com/sites/koole-io/deploys)

## Adding buildings
To add buildings, edit `src/buildings.json`.

All buildings are symmetrical, there can only be one block per layer, and
blocks are always centered on the middle of the building. For example:

Correct:

```
"  xxxx  "
```

Incorrect, all result in the same block as above:

```
"xxxx    "
```

```
"xx  xx"
```

```
"x xx x"
```

## Building JS bundle
To build, run:

```yarn webpack```

## Fonts

The fonts used on this website can be found here:

- [Syne Extra](https://lucasdescroix.fr/syne)