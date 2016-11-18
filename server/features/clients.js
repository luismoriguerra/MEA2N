var express = require('express'),
    rutas = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;
/**
 * GET    /CLIENTS/ list of active clients
 * POST   /CLIENTS/ save a new client
 */

/**
 * Client Object
 *
 * id
 * legacy_id
 * description
 * status
 * created_by
 * created_at
 * updated_by
 * updated_at
 */

rutas.route('/')
  .get(function (req, res) {
    'use strict';
    var filter = {
          description: req.query.description,
          pageStart: parseInt(req.query.skip || 0, 10),
          pageCount: parseInt(req.query.limit || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT * FROM CLIENTS WHERE 1 ',
        countQuery = 'SELECT COUNT(ID) AS COUNTER FROM CLIENTS WHERE 1 ',
        commonQuery = 'AND STATUS = 1 ',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (filter.description) {
      commonQuery += 'AND DESCRIPTION LIKE ? ';
      dataParams.push('%' + filter.description.replace(/ /g, '%') + '%');
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
      dataQuery += 'ID ASC ';
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
    var clientBP = req.body,
        client = {};

    client.description = clientBP.description;
    client.legacy_id = clientBP.legacy_id || null;

    // Set default values
    client.status = 1;
    client.created_at = new Date();
    client.created_by = req.user && req.user.id || -1;

    db.query('INSERT INTO CLIENTS SET ?;', client, function (err, result) {
      var userClient = {};

      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      } else {
        // Assign the client created to the user that created it
        userClient.user_id = req.user && req.user.id || -1;
        userClient.client_id = result.insertId;
        userClient.status = 1;

        db.query('INSERT INTO USERS_CLIENTS SET ?;', userClient, function (err) {
          if (err) {
            printLog(err);
            res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
            return;
          } else {
            res.json({result: {code: '001', message: 'ok', id: userClient.client_id}});
          }
        });
      }
    });
  });

rutas.route('/:id')
  .get(function (req, res) {
    'use strict';
    var client_id = req.params.id,
        query = 'SELECT * FROM CLIENTS WHERE ID = ?';

    db.query(query, [client_id], function (err, rows) {
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
        clientBP = req.body,
        client = {};

    client.legacy_id = clientBP.legacy_id || null;
    client.description = clientBP.description;
    // Set default values
    client.updated_at = new Date();
    client.updated_by = req.user && req.user.id || -1;

    db.query('UPDATE CLIENTS SET ? WHERE ID = ?;', [client, id],
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
        client = {
          // Set default values
          status: -1,
          updated_at: new Date(),
          updated_by: req.user && req.user.id || -1
        };

    db.query('UPDATE CLIENTS SET ? WHERE ID = ?;', [client, id],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        res.json({result: {code: '001', message: 'ok'}});
      });
  });

module.exports = rutas;
