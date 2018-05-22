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

## Browser usage

Browser usage is not supported at this time.


## Options

Options can be passed into *constructor* or changed later by method `setOptions()`.
The *constructor* copies all values into new option object and method `setOptions()` then merges
new values into the existing ones.

```javascript
var LessPluginVersion = require('less-plugin-version', { optionA: true, optionB: false});

LessPluginVersion.setOptions({optionC: true}); //add new option, keep existing ones

LessPluginVersion.setOptions({optionB: true}); //change option, keep others
``` 


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
```javascript
   verbose: grunt.option('verbose')
``` 
Then it will output the information when you run `grunt less --verbose`.

### from

_default: undefined_
  
By default the version hash is generated from file's modification time which is OK when the LESS files are
compiled on production server from files that won't be edited anymore.

However if the files are compiled on a developer machine before they are committed into a repository, their
modification time may change each time someone does a checkout or an update from the repository. In such cache
it is better to generate the version hash from file's content to make sure it changed only when the file
really changed. Generating version hash from file's content is slower but it should not matter when it's
done before a commit and not on-the-fly on a server.

```javascript
    from: 'content'
```

This way you don't need to recompile the LESS files each time you update your repository. 

However note that if a file (image) is included both from CSS (whose version hash is generated from content by 
this plugin) and HTML (whose version hash is generated from modification time on-the-fly by the server)
the file will have different version hashes in CSS and HTML and will be downloaded twice by the client.
*If this is a problem, either include the file as a background image from the CSS or define the CSS
as inline style in your HTML. For best solution, modify your server version hash generator to generate hash from
file's content and then cache it until the file's modification time changes.* 

## Example

```less
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
```bash
Failed to process function versioned('/img/logo-missing.jpg') with error "<error description>" in file less/test.less
```

## Cache

The plugin uses cache for already generated version hashes so that it does not have to generate it again
when the file is referenced from several LESS files. This is especially useful when the option `from: 'content'`
is used. To see how the cache is used you can use the `verbose: true` option.

This cache is not saved to the disk and is valid only for one run of the less compiler or grunt task.   

## Note for Windows users
The plugin may internally convert backslashes in paths into slashes. Windows should support both
 backward and forward slashes in paths and also should look for the folder root (`/`) on the system disk (`c:\`). 
 To support all systems you should configure the plugin using the forward slashes.
 
 For example when you configure `root: /www/` the plugin will look into folder `c:\www`on Windows 
 but in the output messages it may mention either `c:\www` or `c:/www`.  
