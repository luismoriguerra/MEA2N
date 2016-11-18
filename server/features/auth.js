var express = require('express'),
    rutas = express.Router(),
    db = require('../core/database.js');
/**
 * GET    /Auth/ get the current session
 */

/**
 * {
 *  id: 1,
    name: 'admin',
    access: '3',
    clients: [ 1, 2, 3, 4 ],
    restrictions: {
      table_name: {
        _view:
        _create:
        _edit:
        _delete:
     },
     ....
 */
// Return user information
rutas.route('/')
  .get(function (req, res) {
    'use strict';

    // check if it is ok or not
    // aqui se puede hacer la busqueda del usuario
    var query = 'select * from USERS where status > 0 and username like \'' + req.user.username + '\'',
        user = {};

    db.query(query, function (err, rows) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, msg: 'Internal Server Error', dev: err});
        return;
      } else if (rows && rows.length) {
        user = rows[0];

        if (user.status == 2) {
          printLog('User status is inactive');
          res.status(500).send({code: 500, msg: 'Usuario inactivo'});
          return;
        }
        // Add allowed clients to the user session
        db.query('select client_id from USERS_CLIENTS where user_id = ' + user.id, function (err, rows) {
          if (rows && rows.length) {
            user.clients = rows.map(function (item) {
              return item.client_id;
            });
          }

          query = 'select e.name, r._view, r._create, r._edit, r._delete  ' +
                'from ENTITIES e ' +
                'left join RESTRICTIONS r  on e.id = r.entity_id and r.user_id = ' + user.id;

          db.query(query, function (err, rows) {
            user.restrictions = {};
            if (rows && rows.length) {
              rows.forEach(function (item) {
                user.restrictions[item.name] = item;
              });
            }
            res.json(user);
          });
        });
      } else {
        printLog('Username: ' + req.user.username + ' not found');
        res.status(500).send({code: 500, msg: 'Usuario no encontrado'});
      }
    });
  });

module.exports = rutas;
