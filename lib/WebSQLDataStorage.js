var WebSQLDataStorage;

module.exports = WebSQLDataStorage = (function() {
  function WebSQLDataStorage(storeName, onReady, onError) {
    this._storeName = storeName;
    this._webSQLDB = openDatabase('OfflineTileImages', '1.0', 'Store tile images for OfflineLeaftMap', 50 * 1024 * 1024);
    this._webSQLDB.transaction((function(_this) {
      return function(tx) {
        return tx.executeSql("CREATE TABLE IF NOT EXISTS " + _this._storeName + " (key unique, image)");
      };
    })(this), onError, onReady);
  }

  WebSQLDataStorage.prototype.get = function(key, onSuccess, onError) {
    return this._webSQLDB.transaction((function(_this) {
      return function(tx) {
        var onSQLSuccess;
        onSQLSuccess = function(tx, results) {
          var len;
          len = results.rows.length;
          if (len === 0) {
            return onSuccess(void 0);
          } else if (len === 1) {
            return onSuccess(results.rows.item(0));
          } else {
            return onError('There should be no more than one entry');
          }
        };
        return tx.executeSql("SELECT * FROM " + _this._storeName + " WHERE key='" + key + "'", [], onSQLSuccess, onError);
      };
    })(this));
  };

  WebSQLDataStorage.prototype.clear = function(onSuccess, onError) {
    return this._webSQLDB.transaction((function(_this) {
      return function(tx) {
        return tx.executeSql("DELETE FROM " + _this._storeName, [], onSuccess, onError);
      };
    })(this));
  };

  WebSQLDataStorage.prototype.put = function(key, object, onSuccess, onError) {
    return this._webSQLDB.transaction((function(_this) {
      return function(tx) {
        return tx.executeSql("INSERT OR REPLACE INTO " + _this._storeName + " VALUES (?, ?)", [key, object.image], onSuccess, onError);
      };
    })(this));
  };

  WebSQLDataStorage.prototype.getDenseBatch = function(tileImagesToQueryArray, onSuccess, onError) {
    if (tileImagesToQueryArray.length === 0) {
      onSuccess([]);
    }
    return this._webSQLDB.transaction((function(_this) {
      return function(tx) {
        var i, j, keys, onSQLSuccess, ref, result, tileImagesToQueryArray2;
        result = [];
        tileImagesToQueryArray2 = [];
        for (i = j = 0, ref = tileImagesToQueryArray.length; 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          tileImagesToQueryArray2.push("'" + tileImagesToQueryArray[i] + "'");
          result.push(void 0);
        }
        keys = tileImagesToQueryArray2.join(',');
        onSQLSuccess = function(tx, results) {
          var index, item, k, ref1;
          for (i = k = 0, ref1 = results.rows.length; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
            item = results.rows.item(i);
            index = tileImagesToQueryArray.indexOf(item.key);
            if (index >= 0) {
              result[index] = item;
            }
          }
          return onSuccess(result);
        };
        return tx.executeSql("SELECT * FROM " + _this._storeName + " WHERE key IN (" + keys + ")", [], onSQLSuccess, onError);
      };
    })(this));
  };

  return WebSQLDataStorage;

})();
