var express = require('express'),
    rutas = express.Router(),
    db = require('../core/database.js');

/**
 * GET    /Users/  GET USERS LIST ARRAY ** Resource.query() in angular
 * POST   /Users/  SAVE A NEW USER OBJECT IN {REQ.BODY} ** instance.$save() in angular
 *
 * GET    /Users/:ID GET USER ID OBJECT {req.params.id} /Users/3 ** Resource.get({user_id: 3}) in angular
 * PUT    /Users/:ID GET USER ID OBJECT TO MODIFY IT {req.params.id} - req.body.data...
 *        /Users/3 ** instance.$update({id: 3}) in angular
 * DELETE /Users/:ID GET USER ID OBJECT TO REMOVE IT {req.params.id}
 *        /Users/3 ** Resource.delete({id: '030402'}) in angular
 *
 */

rutas.route('/Departamento')
  .post(function (req, res) {
    'use strict';

    var name = req.body.name,
        newId = 0,
        zone = {};

    db.query('select 1 from UBIGEO where name = ? and codprov = 0 and coddist = 0 and status = 1', [name],
      function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {
          // Generate new code ubigeo
          db.query('SELECT max(coddpto) dpto from UBIGEO', function (err, rows) {
            if (err) {
              printLog(err);
              res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
              return;
            }
            newId = 1 + rows[0].dpto;

            zone.coddpto = newId;
            zone.codprov = 0;
            zone.coddist = 0;
            zone.name = name;
            zone.code = newId < 10 ? '0' + newId + '0000' : newId + '0000';
            zone.status = 1;

            db.query('insert into UBIGEO SET ? ', zone, function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                return;
              }
              res.json({results: {code: '001', message: 'ok'}});
            });
          });
        } else {
          res
            .status(401)
            .json({results: {code:'error', message: 'El nombre de departamento ya exite' }});
        }
      });
  });

rutas.route('/Departamento/:id')
  .get(function (req, res) {
    'use strict';

    var id = req.params.id;

    db.query('select * from UBIGEO where coddpto = ?  and status = 1', [id], function (error, rows) {
      if (error) {
        printLog(error);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: error});
        return;
      }
      res
        .status(200)
        .json(rows[0]);
    });

  })
  .delete(function (req, res) {
    'use strict';

    // Cast code so every dependence is updated
    var coddpto = req.params.id.substring(0, 2);

    db.query('update UBIGEO set status = "0" where coddpto = ?', [coddpto], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }
      res.json({results: {code: '001', message: 'ok'}});
    });
  })
  .put(function (req, res) {
    'use strict';

    var name = req.body.name,
        id = req.params.id,
        zone = {};

    db.query('select 1 from UBIGEO where name = ? and codprov = 0 and coddist = 0 and status = 1 and coddpto <> ?',
      [name, id], function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {
          zone.name = name;

          db.query('update UBIGEO SET ?  where coddpto = ? and codprov = 0 and coddist = 0', [zone, id],
            function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                return;
              }
              res.json({results: {code: '001', message: 'ok'}});
            });
        } else {
          res
            .status(401)
            .json({results: {code:'error', message: 'El nombre de departamento ya exite' }
            });
        }
      });
  });


rutas.route('/Provincia')
  .post(function (req, res) {
    'use strict';

    var name = req.body.name,
        dpto = req.body.dpto,
        newId = 0,
        zone = {};

    db.query('select 1 from UBIGEO where ' +
      // Check only provinces belonging to the same department
      'coddpto = ? and ' +
      // Check level of zone (this means the zone is a province)
      'codprov <> 0 and coddist = 0 and ' +
      // Check name and that is a valid zone
      'name = ? and status = 1;', [dpto, name], function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {
          // Generate new code ubigeo
          db.query('SELECT IFNULL(max(codprov),0) id from UBIGEO  where coddpto = ?', [dpto], function (err, rows) {
            var cDpto,
                cProv,
                cDist;

            if (err) {
              printLog(err);
              res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
              return;
            }
            newId = 1 + rows[0].id;

            // Generate code
            cDpto = dpto < 10 ? '0' + dpto: dpto;
            cProv = newId < 10 ? '0' + newId: newId;
            cDist = '00';

            zone.coddpto = dpto;
            zone.codprov = newId;
            zone.coddist = 0;
            zone.name = name;
            zone.code = cDpto + cProv + cDist;
            zone.status = 1;

            db.query('insert into UBIGEO SET ? ', zone, function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
              }

              res.json({results: {code: '001', message: 'ok'}});
            });
          });
        } else {
          res
            .status(401)
            .json({results: {code:'error', message: 'El nombre de provincia ya exite' }
            });
        }
      });
  });

rutas.route('/Provincia/:id')
  .get(function (req, res) {
    'use strict';

    var id = req.params.id,
        dpto = req.query.dpto;

    db.query('select * from UBIGEO where coddpto = ? and codprov = ?  and status = 1', [dpto, id],
      function (error, rows) {
        if (error) {
          printLog(error);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: error});
          return;
        }
        res
          .status(200)
          .json(rows[0]);
      });
  })
  .delete(function (req, res) {
    'use strict';

    var codprov = req.params.id.substring(2, 4);

    db.query('update UBIGEO set status = "0" where codprov = ?;', [codprov],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }
        res.json({results: {code: '001', message: 'ok'}});
      });
  })
  .put(function (req, res) {
    'use strict';

    var name = req.body.name,
        dpto = req.body.dpto,
        id = req.params.id,
        zone = {};

    db.query('select 1 from UBIGEO where ' +
      // Check only provinces belonging to the same department
      'coddpto = ? and ' +
      // Check level of zone (this means the zone is a province)
      'codprov <> 0 and coddist = 0 and ' +
      // Check for other provinces but the one you're updating
      'codprov <> ? and ' +
      // Check name and that is a valid zone
      'name = ? and status = 1;', [dpto, id, name], function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {
          zone.name = name;

          db.query('update UBIGEO SET ? where coddpto = ? and codprov = ? and coddist = 0', [zone, dpto, id],
            function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                return;
              }
              res.json({results: {code: '001', message: 'ok'}});
            });
        } else {
          res
            .status(401)
            .json({results: {code: 401, message: 'El nombre de provincia ya exite' }});
        }
      });
  });


rutas.route('/Distrito')
  .post(function (req, res) {
    'use strict';

    var name = req.body.name,
        dpto = req.body.dpto,
        prov = req.body.prov,
        newId = 0,
        zone = {};

    db.query('select 1 from UBIGEO where ' +
      // Check only districts belonging to the same department and province
      'coddpto = ? and codprov = ? and ' +
      // Check level of zone (this means the zone is a district)
      'codprov <> 0 and coddist <> 0 and ' +
      // Check name and that is a valid zone
      'name = ? and status = 1;', [dpto, prov, name], function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {
          // Generate new code ubigeo
          db.query('SELECT IFNULL(max(coddist),0) id from UBIGEO  where coddpto = ? and codprov = ?', [dpto, prov],
            function (err, rows) {
              var cDpto,
                  cProv,
                  cDist;

              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                return;
              }
              newId = 1 + rows[0].id;

              // Generate code
              cDpto = dpto < 10 ? '0' + dpto : dpto;
              cProv = prov < 10 ? '0' + prov : prov;
              cDist = newId < 10 ? '0' + newId : newId;


              zone.coddpto = dpto;
              zone.codprov = prov;
              zone.coddist = newId;
              zone.name = name;
              zone.code = cDpto + cProv + cDist;
              zone.status = 1;

              db.query('insert into UBIGEO SET ? ', zone, function (err) {
                if (err) {
                  printLog(err);
                  res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                  return;
                }

                res.json({results: {code: '001', message: 'ok'}});
              });
            });
        } else {
          res
            .status(401)
            .json({results: {code: 401, message: 'El nombre de distrito ya exite'}});
        }
      });
  });

rutas.route('/Distrito/:id')
  .get(function (req, res) {
    'use strict';

    var id = req.params.id,
        dpto = req.query.dpto,
        prov = req.query.prov;

    db.query('select * from UBIGEO where coddpto = ? and codprov = ? and coddist = ?  and status = 1', [dpto, prov, id],
      function (error, rows) {
        if (error) {
          printLog(error);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: error});
          return;
        }
        res
          .status(200)
          .json(rows[0]);
      });
  })
  .delete(function (req, res) {
    'use strict';

    var coddist = req.params.id.substring(4, 6);

    db.query('update UBIGEO set status = "0" where coddist = ?;', [coddist],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }
        res.json({results: {code: '001', message: 'ok'}});
      });

  })
  .put(function (req, res) {
    'use strict';

    var name = req.body.name,
        dpto = req.body.dpto,
        prov = req.body.prov,
        id = req.params.id,
        zone = {};

    db.query('select 1 from UBIGEO where ' +
      // Check only districts belonging to the same department and province
      'coddpto = ? and codprov = ? and ' +
      // Check level of zone (this means the zone is a district)
      'codprov <> 0 and coddist <> 0 and ' +
      // Check for other districts but the one you're updating
      'coddist <> ? and ' +
      // Check name and that is a valid zone
      'name = ? and status = 1;', [dpto, prov, id, name], function (err, rows) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        if (rows.length === 0) {

          zone.name = name;

          db.query('update UBIGEO SET ? where coddpto = ? and codprov = ? and coddist = ?', [zone, dpto, prov, id],
            function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
                return;
              }
              res.json({results: {code: '001', message: 'ok'}});
            });
        } else {
          res
            .status(401)
            .json({results: {code: 401, message: 'El nombre de distrito ya exite' }});
        }
      });
  });

module.exports = rutas;
