var express = require('express'),
    routes = express.Router(),
    db = require('../core/database.js');

/**
 * InternalClient Object
 *
 * id
 * legacy_id
 * client_id
 * name
 * short_name
 * address
 * ruc
 * ubigeo_id
 * status
 * created_by
 * created_at
 * updated_by
 * updated_at
 */

routes.route('/')
  .get(function (req, res) {
    'use strict';
    var filter = {
          id_client: req.query.id_client,
          name: req.query.name,
          pageStart: parseInt(req.query.pageStart || 0, 10),
          pageCount: parseInt(req.query.pageCount || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT IC.id, IC.legacy_id, IC.client_id, IC.name, IC.short_name, ' +
          'IC.address, IC.ruc, IC.status, U.code ubigeo_id, U.name ubigeo_desc ' +
          'FROM INTERNAL_CLIENTS IC LEFT JOIN UBIGEO U ' +
          'ON IC.ubigeo_id = U.code AND U.STATUS = 1 WHERE 1 ',
        countQuery = 'SELECT COUNT(ID) AS COUNTER FROM INTERNAL_CLIENTS IC WHERE 1 ',
        commonQuery = 'AND IC.STATUS = 1 ',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = 'IC.' + req.query.sort + ' ' + req.query.sort_dir;
    }

    if (filter.id_client) {
      commonQuery += 'AND IC.ID_CLIENT = ? ';
      dataParams.push(filter.id_client);
      countParams.push(filter.id_client);
    }

    if (filter.name) {
      // For search key look into both name and short name
      commonQuery += 'AND (IC.NAME LIKE ? ';
      dataParams.push('%' + filter.name + '%');
      countParams.push('%' + filter.name + '%');

      commonQuery += 'OR IC.SHORT_NAME LIKE ?) ';
      dataParams.push('%' + filter.name + '%');
      countParams.push('%' + filter.name + '%');
    }

    // Add conditions
    dataQuery += commonQuery;
    countQuery += commonQuery;

    // Add an ORDER BY sentence
    dataQuery += ' ORDER BY ';
    if (filter.orderBy) {
      dataQuery += filter.orderBy;
    } else {
      dataQuery += 'IC.ID DESC';
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

      /**
       * Result format: {results:{list:[], totalResults:0}}
       */
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
    var internalClientPB = req.body,
        internalClient = {};

    internalClient.client_id = internalClientPB.client_id;
    internalClient.name = internalClientPB.name;
    internalClient.short_name = internalClientPB.short_name;
    internalClient.address = internalClientPB.address;
    internalClient.ruc = internalClientPB.ruc;
    internalClient.ubigeo_id = internalClientPB.ubigeo_id || null;

    // Set default values
    internalClient.status = 1;
    internalClient.created_at = new Date();
    internalClient.created_by = req.user && req.user.id || -1;

    db.query('INSERT INTO INTERNAL_CLIENTS SET ?;', internalClient, function (err, result) {
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
    var internalClientId = req.params.id,
        dataQuery = 'SELECT IC.id, IC.legacy_id, IC.client_id, IC.name, IC.short_name, ' +
          'IC.address, IC.ruc, IC.status, U.code ubigeo_id, U.name ubigeo_desc ' +
          'FROM INTERNAL_CLIENTS IC ' +
          'LEFT JOIN UBIGEO U ON IC.ubigeo_id = U.code AND U.STATUS = 1 where ic.id = ?;';

    db.query(dataQuery, [internalClientId], function (err, rows) {
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
        internalClientPB = req.body,
        internalClient = {};

    internalClient.legacy_id = internalClientPB.legacy_id || null;
    internalClient.client_id = internalClientPB.client_id;
    internalClient.name = internalClientPB.name;
    internalClient.short_name = internalClientPB.short_name;
    internalClient.address = internalClientPB.address;
    internalClient.ruc = internalClientPB.ruc;
    internalClient.ubigeo_id = internalClientPB.ubigeo_id || null;

    // Set default values
    internalClient.updated_at = new Date();
    internalClient.updated_by = req.user && req.user.id || -1;

    db.query('UPDATE INTERNAL_CLIENTS SET ? WHERE ID = ?;', [internalClient, id],
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
        internalClient = {
          // Set default values
          status: -1,
          updated_at: new Date(),
          updated_by: req.user && req.user.id || -1
        };

    db.query('UPDATE INTERNAL_CLIENTS SET ? WHERE ID = ?;', [internalClient, id],
      function (err) {
        if (err) {
          printLog(err);
          res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
          return;
        }

        res.json({result: {code: '001', message: 'ok'}});
      });
  });

module.exports = routes;
