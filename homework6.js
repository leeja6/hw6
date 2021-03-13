var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', 7371);
app.use(cors());


var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs290_leeja6',
  password        : '1997',
  database        : 'cs290_leeja6'
});

module.exports.pool = pool;

app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.send('home');
    })
  });
});

app.get("/test", function(req, res, next) {
  res.send("hello")
})
app.get('/',function(req,res,next){
  if (req.query['s']==1) {
    pool.query('SELECT * FROM workouts', function(err, rows, fields){
     if(err){
       next(err);
       return;
     }
     res.send(rows);
    });
  } else if (req.query['d']==1) {
      pool.query('DELETE from workouts WHERE id=?', [req.query.id], function(err,result){
        if(err){
          next(err);
          return;
        }
        res.send("Deleted "+result.affectedRows+" row(s).")
      }
    )
  }
});

app.post('/',function(req,res,next){
  if (req.query['i']==1) {
    console.log("HELLO ~ HELLO ~ HELLO");
    console.log(req.body);
    pool.query("INSERT INTO workouts(`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?,?,?,?,?)", [req.body.name,req.body.reps,req.body.weight,req.body.date,req.body.lbs], function(err, result){
      if(err){
        console.log(err);
        next(err);
        return;
      };
      console.log(result);
      res.send(String(result.insertId));
    });
  } else if (req.query['u']==1) {
    console.log(req.body);
    pool.query("SELECT * FROM workouts WHERE id=?", [req.query.id], function(err, result){
      if(err){
        next(err);
        return;
      }
      console.log(result)
      if(result.length == 1){
        var curVals = result[0];
        pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
          [req.body.name || curVals.name, req.body.reps || curVals.reps, req.body.weight || curVals.weight, req.body.date || curVals.date, req.body.lbs || curVals.lbs, req.query.id],
          function(err, result){
          if(err){
            next(err);
            return;
          }
          res.send(result);
        });
      }
    })
  }
});

app.use(function(req,res){
  res.type('text/plain');
  res.status(404);
  res.send('404 - Not Found');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.send('500 - Server Error');s
});


app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
