function createObjects(JSONText) {
   // Start public domain parseJSON block
   (function (s) {
      // This prototype has been released into the Public Domain, 2007-03-20; Original Authorship: Douglas Crockford, Originating Website:
      // http://www.JSON.org, Originating URL : http://www.JSON.org/JSON.js
      var m = {
         '\b': '\\b',
         '\t': '\\t',
         '\n': '\\n',
         '\f': '\\f',
         '\r': '\\r',
         '"': '\\"',
         '\\': '\\\\'
      };
      s.parseJSON = function (filter) {
         try {
            if (/^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/.test(this)) {
               var j = eval('(' + this + ')');
               if (typeof filter === 'function') {
                  function walk(k, v) {
                     if (v && typeof v === 'object') {
                        for (var i in v) {
                           if (v.hasOwnProperty(i)) {
                              v[i] = walk(i, v[i]);
                           }
                        }
                     }
                     return filter(k, v);
                  }
                  j = walk('', j);
               }
               return j;
            }
         }
         catch (e) {}
         throw new SyntaxError("parseJSON");
      };
   })(String.prototype);
   // End public domain parseJSON block

   return JSONText.parseJSON();
};