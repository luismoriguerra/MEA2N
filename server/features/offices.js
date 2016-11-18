var express = require('express'),
    routes = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;

/**
 * Office Object
 *
 * id
 * legacy_id
 * client_id
 * name
 * address
 * telephone
 * email
 * status
 * created_by
 * created_at
 * updated_by
 * updated_at
 */

routes.route('/')
  .get(function (req, res) {
    'use strict';
    var office = {
          id: req.query.id,
          client_id: req.query.client_id,
          name: req.query.name,
          ruc: req.query.ruc
        },
        filter = {
          pageStart: parseInt(req.query.skip || 0, 10),
          pageCount: parseInt(req.query.limit || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT O.*, C.DESCRIPTION AS \'client_name\' ' +
          'FROM OFFICES O LEFT JOIN CLIENTS C ON O.CLIENT_ID = C.ID WHERE 1 ',
        countQuery = 'SELECT COUNT(O.ID) AS COUNTER FROM OFFICES O WHERE 1 ',
        commonQuery = 'AND O.STATUS = 1 ',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (office.id) {
      commonQuery += 'AND O.ID IN (?) ';
      dataParams.push(office.id);
    }

    if (office.client_id) {
      commonQuery += 'AND O.CLIENT_ID IN (?) ';
      dataParams.push(office.client_id);
    }

    if (office.name) {
      commonQuery += 'AND O.NAME LIKE ? ';
      dataParams.push('%' + office.name + '%');
    }

    if (office.ruc) {
      commonQuery += 'AND O.RUC LIKE ? ';
      dataParams.push('%' + office.ruc + '%');
    }

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
      dataQuery += 'O.ID ASC';
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
        return;
      }

      rows = rows || [{}];

      res.json({
        results: {
          list:rows[0],
          count: rows[1][0].COUNTER
        }
      });
    });
  })
  .post(function (req, res) {
    'use strict';
    var officeBP = req.body,
        office = {};

    office.name = officeBP.name;
    office.address = officeBP.address;
    office.telephone = officeBP.telephone;
    office.email = officeBP.email;
    office.client_id = officeBP.client_id;
    office.legacy_id = officeBP.legacy_id || null;

    // Set default values
    office.status = 1;
    office.created_at = new Date();
    office.created_by = req.user && req.user.id || -1;

    db.query('INSERT INTO OFFICES SET ?;', office, function (err, result) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok', id: result.insertId}});
    });
  });

routes.route('/:id')
  .get(function (req, res) {
    'use strict';
    var officeId = req.params.id,
        dataQuery = 'SELECT O.*, C.DESCRIPTION AS \'client_name\' ' +
          'FROM OFFICES O LEFT JOIN CLIENTS C ON O.CLIENT_ID = C.ID ' +
          'WHERE O.STATUS = 1 AND O.ID = ?;';

    db.query(dataQuery, [officeId], function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      rows = rows || [{}];

      res.json(rows[0]);
    });
  })
  .put(function (req, res) {
    'use strict';
    var id = req.params.id,
        officeBP = req.body,
        office = {};

    office.name = officeBP.name;
    office.address = officeBP.address;
    office.telephone = officeBP.telephone;
    office.email = officeBP.email;
    office.client_id = officeBP.client_id;
    office.legacy_id = officeBP.legacy_id || null;

    // Set default values
    office.updated_at = new Date();
    office.updated_by = req.user && req.user.id || -1;

    db.query('UPDATE OFFICES SET ? WHERE ID = ?;', [office, id],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        res.json({result: {code: '001', message: 'ok'}});
      });
  })
  .delete(function (req, res) {
    'use strict';
    var id = req.params.id,
        office = {
          // Set default values
          status: -1,
          updated_at: new Date(),
          updated_by: req.user && req.user.id || -1
        };

    db.query('UPDATE OFFICES SET ? WHERE ID = ?;', [office, id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });

module.exports = routes;
