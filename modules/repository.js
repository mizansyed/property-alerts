var util = require("util");
var events = require("events");

function Repository() {
    events.EventEmitter.call(this);
    var path = require('path');
    var appDir = path.dirname(require.main.filename);
    var fs = require("fs");
    this.sqlFile = appDir + "/storage/" + "homealert.sqlite";
    this.dbExists = fs.existsSync(this.sqlFile);

    this.isDbOpen = false;

    if(!this.dbExists){
        fs.openSync(this.sqlFile, "w");
        this.createTables();
    }

};

util.inherits(Repository, events.EventEmitter);

Repository.prototype.openDb = function (){

    if (this.isDbOpen) return;
    var sqlite3 = require('sqlite3').verbose();
    this.db = new sqlite3.Database(this.sqlFile);
    this.isDbOpen = true;

}


Repository.prototype.closeDb = function (){

    this.db.close()
    this.isDbOpen = false;

}


Repository.prototype.createTables = function (){

    this.openDb();
    this.db.serialize(function() {
        var createTableSql = 'CREATE  TABLE  IF NOT EXISTS "properties" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL  UNIQUE , "zoopla_id" VARCHAR, "address" VARCHAR, "img" VARCHAR, "price" INTEGER, "details_url" VARCHAR, "post_town" VARCHAR, "alerted" BOOL, "created_at"  DEFAULT CURRENT_TIMESTAMP)';
        this.db.run(createTableSql);
        this.emit("TablesCreated");
    });
    this.closeDb();

}


Repository.prototype.saveToDb = function (data, callback){

    var self = this;
    self.openDb();
    var db = this.db;

    db.serialize(function() {
        var insert_sql = 'INSERT INTO properties (zoopla_id, address, img, price, details_url, post_town, alerted) SELECT $zoopla_id, $address, $img, $price, $details_url, $post_town, $alerted WHERE NOT EXISTS (SELECT 1 FROM properties WHERE zoopla_id = $zoopla_id)';
        db.run("BEGIN");
        for (var index in data) {
            if (data.hasOwnProperty(index)) {
                db.run(insert_sql, {
                    $zoopla_id: data[index].listing_id,
                    $img: data[index].image_url,
                    $address: data[index].displayable_address,
                    $price: data[index].price,
                    $details_url: data[index].details_url,
                    $post_town: data[index].post_town,
                    $alerted: 0
                }, function(error){
                    if (error) {
                        db.close()
                        return callback(error, null);
                    }
                })
            }
        }
        db.run("COMMIT")
    });

    db.close()
    callback(null, 'Saved');
    self.emit("SavedToDb");

}


Repository.prototype.getLatestProperties = function (callback){

    var self = this;
    self.openDb();
    db = self.db;

    db.all("SELECT address, img, details_url FROM properties ORDER by created_at DESC", function(err, rows) {
        if (err) {
            console.log(err);
            db.close();
            callback(err);
        } else
        {
            callback(null, rows);
        }
    });
    db.close();
}


Repository.prototype.getUnalertedProperties = function (callback){
    var self = this;
    self.openDb();
    db = self.db;

    db.all("SELECT zoopla_id, address, img, details_url FROM properties WHERE alerted = 0", function(err, rows) {
        if (err) {
            console.log(err);
            db.close();
            callback(err);
        } else
        {
            callback(null, rows);
        }
    });
    db.close();
}

Repository.prototype.updateAlertedProperty = function (data, callback){

    var self = this;
    self.openDb();
    db = self.db;
    var update_sql = 'UPDATE properties SET alerted = 1 WHERE zoopla_id = $zoopla_id AND alerted = 0';
    db.run(update_sql, {
        $zoopla_id: data.zoopla_id
    }, function(error){
        if (error) {
            db.close()
            return callback(error, null);
        } else
        {
            callback(null);
        }
    })
    db.close()
}


Repository.prototype.updateAlertedProperties = function (data, callback){

    var self = this;
    self.openDb();
    db = self.db;

    db.serialize(function() {
        var update_sql = 'UPDATE properties SET alerted = 1 WHERE zoopla_id = $zoopla_id AND alerted = 0';
        db.run("BEGIN");
        for (var index in data) {
            if (data.hasOwnProperty(index)) {
                db.run(update_sql, {
                    $zoopla_id: data.zoopla_id
                }, function(error){
                    if (error) {
                        db.close()
                        return callback(error, null);
                    }
                })
            }
        }
        db.run("COMMIT")
    });

    db.close()
    callback(null);
    self.emit("UpdateAlertedProperties");
}

module.exports =  Repository;