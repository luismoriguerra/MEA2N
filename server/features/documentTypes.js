var express = require('express'),
    routes = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;

/**
 * DocumentType Object
 *
 * id
 * name
 * status
 * created_by
 * created_at
 * updated_by
 * updated_at
 */

routes.route('/')
  .get(function (req, res) {
    'use strict';
    var docType = {
          id: req.query.id,
          name: req.query.name
        },
        filter = {
          pageStart: parseInt(req.query.pageStart || 0, 10),
          pageCount: parseInt(req.query.pageCount || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT * FROM DOCUMENT_TYPE WHERE 1 ',
        countQuery = 'SELECT COUNT(ID) AS COUNTER FROM DOCUMENT_TYPE WHERE 1 ',
        commonQuery = 'AND STATUS = 1 ',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (docType.id) {
      commonQuery += 'AND ID = ? ';
      dataParams.push(docType.id);
    }

    if (docType.name) {
      commonQuery += 'AND NAME LIKE ? ';
      dataParams.push('%' + docType.name + '%');
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
      dataQuery += 'ID DESC';
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

      rows = rows || [];

      /**
       * Result format: {results:{list:[], count:0}}
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
    var docTypeBP = req.body,
        docType = {};

    docType.name = docTypeBP.name;
    // Set default values
    docType.created_at = new Date();
    docType.status = 1;
    docType.created_by = req.user && req.user.id || -1;

    db.query('INSERT INTO DOCUMENT_TYPE SET ?;', docType, function (err, result) {
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
    var id = req.params.id,
        dataQuery = 'SELECT * FROM DOCUMENT_TYPE WHERE ID = ?;';

    db.query(dataQuery, [id], function (err, rows) {
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
        docTypeBP = req.body,
        docType = {};

    docType.name = docTypeBP.name;
    // Set default values
    docType.updated_at = new Date();
    docType.updated_by = req.user && req.user.id || -1;

    db.query('UPDATE DOCUMENT_TYPE SET ? WHERE ID = ?;', [docType, id],
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
        docType = {
          // Set default values
          updated_at: new Date(),
          status: -1,
          updated_by: req.user && req.user.id || -1
        };

    db.query('UPDATE DOCUMENT_TYPE SET ? WHERE ID = ?;', [docType, id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });

module.exports = routes;
