less-plugin-version
====================================

Adds function that calculates version hash for files. 

 ## Instalation

```
npm install -g nothrem/less-plugin-version
```

## Programmatic usage

```
var LessPluginVersion = require('less-plugin-version');
less.render(lessString, { plugins: [new LessPluginVersion({root: 'www'})] })
  .then(
```

## Grunt configuration

```
less: {
    options: {
        plugins:           [
            new (require('less-plugin-version'))({
                root: 'www'
            })
        ]
    },
    files: ...
```

## Browser usage

Browser usage is not supported at this time.

## Example

```css
.logo { background-image: versioned('/img/logo.jpg'); }
.logo-broken { background-image: versioned('/img/logo-missing.jpg'); }
```

outputs:

```css
.logo { background-image: url(/img/logo.jpg?1a2b3c4d); }
.logo-broken { background-image: url(/img/logo-missing.jpg?00000000); }
```

_In case of an internal error outputs:_
```css
.logo-broken { background-image: url(/img/logo-missing.jpg?error=<error description>); }
```

_... and also prints into error console:_
```
Failed to process function versioned('/img/logo-missing.jpg') with error "<error description>" in file less/test.less
```
