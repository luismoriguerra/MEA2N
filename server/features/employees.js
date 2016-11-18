var express = require('express'),
    routes = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;

/**
 * Employee Object
 *
 * id
 * client_id
 * first_name
 * last_name
 * second_last_name
 * birth_date: 'yyyy-mm-dd'
 * gender
 * doc_type
 * doc_number
 * address
 * telephone
 * start_date: 'yyyy-mm-dd'
 * license
 * status
 * marital_status
 * charge
 * type
 * created_by
 * created_at
 * updated_by
 * updated_at
 */

routes.route('/')
  .get(function (req, res) {
    'use strict';
    var filter = {
          name: req.query.name,
          pageStart: parseInt(req.query.pageStart || 0, 10),
          pageCount: parseInt(req.query.pageCount || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT id, client_id, first_name, last_name, second_last_name, gender, doc_type, ' +
          'DATE_FORMAT(birth_date,\'%d/%c/%Y\') as f_birth_date, ' +
          'DATE_FORMAT(start_date,\'%d/%c/%Y\') as f_start_date, ' +
          'doc_number, address, telephone, license, status, marital_status, charge, type ' +
          'FROM EMPLOYEES WHERE 1 ',
        countQuery = 'SELECT COUNT(ID) AS COUNTER FROM EMPLOYEES WHERE 1 ',
        commonQuery = 'AND STATUS >= 1 ',
        dataParams = [],
        countParams = [];

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = req.query.sort + ' ' + req.query.sort_dir;
    }

    if (filter.name) {
      commonQuery += 'AND CONCAT_WS(" ", FIRST_NAME, LAST_NAME, SECOND_LAST_NAME) LIKE ? ';
      dataParams.push('%' + filter.name.replace(/ /g, '%') + '%');
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
    var employeeBP = req.body,
        employee = {};

    employee.id = employeeBP.id;
    employee.client_id = employeeBP.client_id;
    employee.first_name = employeeBP.first_name;
    employee.last_name = employeeBP.last_name;
    employee.second_last_name = employeeBP.second_last_name;
    employee.birth_date = employeeBP.birth_date || null;
    employee.gender = employeeBP.gender;
    employee.doc_type = employeeBP.doc_type;
    employee.doc_number = employeeBP.doc_number;
    employee.address = employeeBP.address;
    employee.telephone = employeeBP.telephone;
    employee.start_date = employeeBP.start_date ||null;
    employee.license = employeeBP.license;
    employee.charge = employeeBP.charge;
    employee.type = employeeBP.type;
    employee.status = employeeBP.status;
    employee.marital_status = employeeBP.marital_status;
    employee.legacy_id = employeeBP.legacy_id;
    // Set default values
    employee.created_at = new Date();
    employee.created_by = req.user && req.user.id || -1;

    db.query('INSERT INTO EMPLOYEES SET ?;', employee, function (err, result) {
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
        dataQuery = 'SELECT id, client_id, first_name, last_name, second_last_name, gender, doc_type, ' +
          'DATE_FORMAT(birth_date,\'%d/%c/%Y\') as f_birth_date, ' +
          'DATE_FORMAT(start_date,\'%d/%c/%Y\') as f_start_date, ' +
          'doc_number, address, telephone, license, status, marital_status, charge, type ' +
          'FROM EMPLOYEES WHERE ID = ?;';

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
        employeeBP = req.body,
        employee = {};

    employee.client_id = employeeBP.client_id;
    employee.first_name = employeeBP.first_name;
    employee.last_name = employeeBP.last_name;
    employee.second_last_name = employeeBP.second_last_name;
    employee.birth_date = employeeBP.birth_date || null;
    employee.gender = employeeBP.gender;
    employee.doc_type = employeeBP.doc_type;
    employee.doc_number = employeeBP.doc_number;
    employee.address = employeeBP.address;
    employee.telephone = employeeBP.telephone;
    employee.start_date = employeeBP.start_date || null;
    employee.license = employeeBP.license;
    employee.charge = employeeBP.charge;
    employee.type = employeeBP.type;
    employee.status = employeeBP.status;
    employee.marital_status = employeeBP.marital_status;
    employee.legacy_id = employeeBP.legacy_id;
    // Set default values
    employee.updated_at = new Date();
    employee.updated_by = req.user && req.user.id || -1;

    db.query('UPDATE EMPLOYEES SET ? WHERE ID = ?;', [employee, id],
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
        employee = {
          // Set default values
          updated_at: new Date(),
          status: -1,
          updated_by: req.user && req.user.id || -1
        };

    db.query('UPDATE EMPLOYEES SET ? WHERE ID = ?;', [employee, id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });

module.exports = routes;
