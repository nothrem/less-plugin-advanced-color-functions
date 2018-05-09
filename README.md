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
                root: 'www/'
            })
        ]
    },
    files: ...
```

## Options

### root

_default: current folder "`.`"_
  
Folder where to look for the files with an absolute path.

For example when `www` is the root folder and the file is `/img/logo.jpg` the plugin will look for a file `./www/img/logo.jpg`. 
    
### lessRoot & cssRoot

_default: folder where the referencing LESS file is stored_
  
Files with a relative path must be searched in a folder where the CSS file is stored which is default
when `lessRoot` or `cssRoot` parameters are not defined. However since the LESS files are usually not stored
in the public folder, you can specify the path mapping as same as you specify _source_ and _destination_ for the LESS compiler.

For example when your theme files are stored in `app/less/theme` and are compiled into folder `www/css/theme`
 you should specify `{lessRoot: 'app/less', cssRoot: 'www/css'}`. Then the plugin will look for 
 a file `../../img/loading.gif` in the folder `./www/css/theme/../../img/` (which is `www/img`).  
    

### verbose

_default: false_
  
When set to True the plugin will log into the console information about versioned files to help you debug
the values for the plugin parameters.

For each file the plugin will output a file name of the referenced file, a file name of the referencing LESS file
and the folder where is looks for the file. Then it will output the calculated hash if the file is found.

Note that if the file does not exist or the path does not reference a file, the plugin will **always** output a warning.

For a grunt task use: 
```
   verbose: grunt.option('verbose')
``` 
Then it will output the information when you run `grunt less --verbose`.

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

# Note for Windows users
The plugin may internally convert backslashes in paths into slashes. Windows should support both
 backward and forward slashes in paths and also should look for the folder root (`/`) on the system disk (`c:\`). 
 To support all systems you should configure the plugin using the forward slashes.
 
 For example when you configure `root: /www/` the plugin will look into folder `c:\www`on Windows 
 but in the output messages it may mention either `c:\www` or `c:/www`.  
