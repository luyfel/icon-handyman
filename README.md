# Icon Handyman

Generate a variety of colors, sizes, densities and file formats from one single folder of seperate svg files. It makes it easy for web, Android en iOS developers to implement custom designed icons.

## SVG's

Place all your svg icons in the `resources/icons` directory. To make all your icons consistent, prefix them with `ic_`, for example: `ic_delete.svg`.

## Configuration

You can find all configuration options in config.json.

`size`

The default canvas size of all icons (default=`24`)

`sizes`

The sizes you want to generate (device independent pixels) (default=`[18, 24, 36, 48]`)

`colors`

The colors you want to generate. Leave `name` empty for the default color.

```
"colors": [
    {
        "name": "",
        "color": "#000000"
    },
    {
        "name": "white",
        "color": "#ffffff"
    }
]
```

### Build all

When you are ready to generate all files, go to the terminal and run `gulp`. Make sure you're in the root directory (where `gulpfile.js` lives).

```
gulp
```

This will create a new folder called `public` with all the necessary files. Currently it takes a long time generating all formats due to the png converter, just be patient. If you know a way to speed up the process, please let us know.

### Build specific exports

You can also generate just the files you need.

```
gulp png-sprite
gulp svg-sprite
gulp web
gulp font
gulp ios
gulp android
```
