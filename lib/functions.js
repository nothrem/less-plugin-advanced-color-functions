module.exports = function(less, options) {
	//setup default values for options
	options = options || {};
	options.root = options.root || '.';

	if (options.verbose) {
		console.log('Compile LESS with options', JSON.stringify(options));
	}

	//Helper method to calculate CRC32 (see https://stackoverflow.com/a/18639999/2011448)
	var crcTable = (function(){
		var c;
		var crcTable = [];
		for(var n =0; n < 256; n++){
			c = n;
			for(var k =0; k < 8; k++){
				c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
			}
			crcTable[n] = c;
		}
		return crcTable;
	})();
	var crc32 = function(str) {
		str = '' + str; //for String to use its methods
		var crc = 0 ^ (-1);

		for (var i = 0; i < str.length; i++ ) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
		}

		return (crc ^ (-1)) >>> 0;
	};

	//Helper method to convert numeric CRC32 into 32-bit hexadecimal string
	var crcHex = function(hash) {
		//see https://stackoverflow.com/a/697841/2011448
		if (hash < 0) {
			hash = 0xFFFFFFFF + hash + 1;
		}
		hash = hash.toString(16);

		//make sure string is always 8 characters long (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart#Polyfill)
		if (hash.length < 8) {
			hash = '0'.repeat(8 - hash.length) + hash;
		}

		return hash;
	}

	less.path = require('path');

	var versionCache = {};

	return {
		/**
		 * Return given URL with appended version of the file (if exists)
		 *
		 * @param {String} URL
		 * @returns {Url}
		 */
		versioned: function( filename ) {
			//try to find the file on disk...
			var file, filepath, root, version, hash, path, url;
			try {
				filename.value = filename.value.replace(/\\/g, '/');
				if ('/' === filename.value[0]) { //absolute file name - look for it in WWW root
					filepath = options.root + filename.value;
					if (options.verbose) {
						console.log('Looking for file ' + filename.value + ' inside ' + options.root + ' folder. Referenced from ' + filename.currentFileInfo.filename);
					}
				}
				else { //relative filename, must look inside the folder where CSS will be stored
					root = less.path.dirname(filename.currentFileInfo.filename) + '/';
					if (options.lessRoot && options.cssRoot) {
						root = root.replace(/\\/g, '/').replace(new RegExp('^' + options.lessRoot.replace(/\\/g, '/'), 'i'), options.cssRoot);
					}
					filepath = root + '/' + filename.value;
					filepath = filepath.replace(/[\\/]+/g, '/');
					if (options.verbose) {
						console.log('Looking for file ' + filename.value + ' inside ' + filepath + ' folder. Referenced from ' + filename.currentFileInfo.filename);
					}
				}
				filepath = less.fs.realpathSync(filepath);
				file = less.fs.statSync(filepath);
			}
			catch (e) { //if file does not exist, use empty hash
				file = false;
			}

			try {
				if (filepath in versionCache) {
					hash = versionCache[filepath];
					if (options.verbose) {
						console.log('File ' + filepath + ' found in cache. Its version hash is ' + hash);
					}
				}
				else {
					//calculate version hash of the file
					if (file && file.isFile()) {
						if ('content' === options.from) {
							version = less.fs.readFileSync(filepath, 'binary'); //calculate version hash from file content to make sure it will be same on each repository export
						}
						else if ('size' === options.from) {
							let stat = less.fs.statSync(filepath);
							version = stat.size;
						}
						else {
							version = Math.floor(new Date(file.mtime).getTime() / 1000); //time compatible with unix (w/o milliseconds)
						}
						hash = crcHex(crc32(version));
						if (options.verbose) {
							console.log('Version hash of file ' + filepath + ' has been calculated to ' + hash);
						}
					}
					else {
						console.warn('File ' + filepath + ' referenced from ' + filename.currentFileInfo.filename + ' not found or is not a file.');
						hash = '00000000';
					}
					versionCache[filepath] = hash;
				}

				//I have no idea what am I doing but this way it returns what I expect without crashing...
				path = new less.tree.Quoted(filename.quote, filename.value + '?' + hash, filename.escaped, filename.index, filename.currentFileInfo);
				URL = new less.tree.URL(path, filename.index, filename.currentFileInfo, false);
				return URL;
			}
			catch (e) {
				console.error('Failed to process function versioned(' + filename.quote + filename.value + filename.quote + ') with error "' + e + '" in file ' + filename.currentFileInfo.filename);
				filename.value += '?error=' + e;
				return filename;
			}
		}
	};
};
