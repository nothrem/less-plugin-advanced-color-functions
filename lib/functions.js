module.exports = function(less, options) {
	//setup default values for options
	options = options || {};
	options.root = options.root || '.';

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

	return {
		/**
		 * Return given URL with appended version of the file (if exists)
		 *
		 * @param {String} URL
		 * @returns {Url}
		 */
		versioned: function( context ) {
			//try to find the file on disk...
			var file;
			try {
				file = less.fs.statSync(options.root + context.value);
			}
			catch (e) { //if file does not exist, use empty hash
				file = false;
			}

			try {
				//calculate version hash of the file
				if (file) {
					var version = Math.floor(new Date(file.mtime).getTime() / 1000); //time compatible with unix (w/o milliseconds)
					var hash = crcHex(crc32(version));
				}
				else {
					hash = '00000000';
				}

				//I have no idea what am I doing but this way it returns what I expect without crashing...
				var path = new less.tree.Quoted(context.quote, context.value + '?' + hash, context.escaped, context.index, context.currentFileInfo);
				var URL = new less.tree.URL(path, context.index, context.currentFileInfo, false);
				return URL;
			}
			catch (e) {
				console.error('Failed to process function versioned(' + context.quote + context.value + context.quote + ') with error "' + e + '" in file ' + context.currentFileInfo.filename);
				context.value += '?error=' + e;
				return context;
			}
		}
	};
};
