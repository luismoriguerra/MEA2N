var express = require('express'),
    routes = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;

/**
 * DocumentType Object
 *
 * codDpto
 * codProv
 * codDist
 * name
 * code
 * status
 * readonly
 */

routes.route('/list')
  .get(function (req, res) {
    'use strict';
    var filter = {
          pageStart: parseInt(req.query.pageStart || 0, 10),
          pageCount: parseInt(req.query.pageCount || 0, 10),
          orderBy: req.query.orderBy
        },
        dataQuery = 'SELECT * FROM UBIGEO WHERE 1 ',
        countQuery = 'SELECT COUNT(Nombre) AS COUNTER FROM UBIGEO WHERE 1 ',
        commonQuery = ' ',
        dataParams = [],
        countParams = [];

    // Counter doesn't need exta params so make a copy of data params at this point
    countParams = extend([], dataParams);
    // Add conditions
    dataQuery += commonQuery;
    countQuery += commonQuery;

    // Add an ORDER BY sentence
    dataQuery += ' ORDER BY ';
    if (filter.orderBy) {
      dataQuery += filter.orderBy;
    } else {
      dataQuery += 'CODE ASC';
    }

    // Set always an start for data
    dataQuery += ' LIMIT ?';
    dataParams.push(filter.pageStart);

    if (filter.pageCount) {
      dataQuery += ', ?';
      dataParams.push(filter.pageCount);
    } else {
      // Request 500 records at most if limit is not specified
      dataQuery += ', 500';
    }

    dataQuery += ';';
    countQuery += ';';

    // Execute both queries at once
    dataParams = dataParams.concat(countParams);

    db.query(dataQuery + countQuery, dataParams, function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      }

      rows = rows || [];

      /**
       * Result format: {results:{list:[], totalResults:0}}
       */
      res.json({
        results: {
          list:rows[0],
          totalResults: rows[1][0].COUNTER
        }
      });
    });
  })
  .post(function (req, res) {
    'use strict';
    var ubigeo = req.body;

    // Set default values
    ubigeo.created_at = new Date();
    ubigeo.status = 1;
    // TODO: get logged user Id
    ubigeo.created_by = 1;

    db.query('INSERT INTO UBIGEO SET ?;', ubigeo, function (err, result) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      }

      res.json({result: {code: '001', message: 'ok', id: result.insertId}});
    });
  })
  .put(function (req, res) {
    'use strict';
    var ubigeo = req.body;

    // Set default values
    ubigeo.updated_at = new Date();
    ubigeo.status = 1;
    // TODO: get logged user Id
    ubigeo.updated_by = 1;

    db.query('UPDATE UBIGEO SET ? WHERE ID = ?;', [ubigeo, ubigeo.id],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        }

        res.json({result: {code: '001', message: 'ok'}});
      });
  })
  .delete(function (req, res) {
    'use strict';
    var ubigeo = req.body;

    // Set default values
    ubigeo.updated_at = new Date();
    ubigeo.status = -1;
    // TODO: get logged user Id
    ubigeo.updated_by = 1;

    db.query('UPDATE UBIGEO SET ? WHERE ID = ?;', [ubigeo, ubigeo.id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });


routes.route('/')
  .get(function (req, res) {
    'use strict';
    var dataQuery = 'select * from ubigeo where ',
        where = ' status = 1 ',
        dpto = +req.query.dpto,
        prov = +req.query.prov;

    if (!dpto) {
      // Show all dpts
      where = where.concat('and coddpto <> 0 and codprov = 0 and coddist = 0');
    } else if (!!dpto && !prov) {
      // show all provs
      where = where.concat('and coddpto = ' + dpto + ' and codprov <> 0 and coddist = 0');
    } else if (!!dpto && prov > 0) {
      // show all dists
      where = where.concat('and coddpto = ' + dpto + ' and codprov = ' + prov + ' and coddist <> 0');
    }

    db.query(dataQuery + where, function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err, sql: dataQuery + where});
      }

      rows = rows || [];

      /**
       * Result format: {results:{list:[], totalResults:0}}
       */
      res
        .status(200)
        .json({
          results: {
            list:rows
          }
        });
    });
  })
  .post(function (req, res) {
    'use strict';
    var zone = {
      name: req.body.name,
      ubigeo_id: req.body.code
    };


    db.query('select 1 from ZONES where ?', {name: zone.name}, function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      if (rows.length === 0) {
        db.query('Insert into ZONES SET ?', zone, function (err) {
          if (err) {
            printLog(err);
            res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
            return;
          }
          res
            .status(201)
            .json({
              results: {
                code:'ok'
              }
            });

        });
      } else {
        res
          .status(401)
          .json({
            results: {
              code:'error',
              message: 'El nombre de zona ya exite'
            }
          });
      }

    });


  });

module.exports = routes;
