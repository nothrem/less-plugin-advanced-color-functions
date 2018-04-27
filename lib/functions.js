module.exports = function(less) {
	//from https://stackoverflow.com/a/18639999/2011448
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
		var crc = 0 ^ (-1);

		for (var i = 0; i < str.length; i++ ) {
			crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
		}

		return (crc ^ (-1)) >>> 0;
	};

	return {
		/**
		 * Return given URL with appended version of the file (if exists)
		 *
		 * @param {String} URL
		 * @returns {Url}
		 */
		versioned: function( context ) {
			try {
				var file = less.fs.statSync('./www' + context.value);
			}
			catch (e) {
				context.value += '?00000000';
				return context;
			}

			try {
				var version = Math.floor(new Date(file.mtime).getTime()/1000); //time compatible with unix (w/o milliseconds)
				var hash = crc32('' + version);
				if (hash < 0) { //https://stackoverflow.com/a/697841/2011448
					hash = 0xFFFFFFFF + number + 1;
				}
				//I have no idea what am I doing but this way it returns what I expect without crashing...
				var path = new less.tree.Quoted(context.quote, context.value + '?' + hash.toString(16), context.escaped, context.index, context.currentFileInfo);
				var URL = new less.tree.URL(path, context.index, context.currentFileInfo, false);
				return URL;
			}
			catch (e) {
				context.value += '@Error: ' + e;
				return context;
			}
		}
	};
};
