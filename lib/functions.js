module.exports = function(less) {
    return {
        /**
         * Return given URL with appended version of the file (if exists)
         *
         * @param {String} URL
         * @returns {Url}
         */
        versioned: function( url ){
        	var version = 0; //TODO
            return 'url(' + url + '?' + version ')';
        }
    };
};
