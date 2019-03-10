# koole.io

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

- [Young Serif](https://github.com/uplaod/YoungSerif)
- [Syne Extra](https://lucasdescroix.fr/syne)