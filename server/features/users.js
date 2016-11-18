var express = require('express'),
    rutas = express.Router(),
    db = require('../core/database.js'),
    extend = require('util')._extend;

/**
 * GET    /Users/  GET USERS LIST ARRAY ** Resource.query() in angular
 * POST   /Users/  SAVE A NEW USER OBJECT IN {REQ.BODY} ** instance.$save() in angular
 *
 * GET    /Users/:ID GET USER ID OBJECT {req.params.id} /Users/3 ** Resource.get({user_id: 3}) in angular
 * PUT    /Users/:ID GET USER ID OBJECT TO MODIFY IT {req.params.id} - req.body.data...
          /Users/3 ** instance.$update({id: 3}) in angular
 * DELETE /Users/:ID GET USER ID OBJECT  TO REMOVE IT {req.params.id} /Users/3 ** Resource.delete({id: 3}) in angular
 *
 */

// app.use('/Users', usersRoutes);

rutas.route('/')
  .get(function (req, res) {
    'use strict';
    var filter = {
          name: req.query.name,
          pageStart: parseInt(req.query.skip || 0, 10),
          pageCount: parseInt(req.query.limit || 0, 10),
          orderBy: ''
        },
        dataQuery = 'SELECT U.id, U.name, U.last_name, U.status, U.role_id, U.legacy_id, U.employee_id, ' +
          'U.username, C.id locate_client, O.id locate_office, U.locate_area, ' +
          'C.description as client_name, O.name as office_name, ' +
          'A.name as area_name, ' +
          // TODO: return a list, this is a really bad practice
          'CONCAT("<ul><li>", (SELECT GROUP_CONCAT(C.description SEPARATOR "</li><li>") ' +
          'FROM USERS_CLIENTS UC ' +
          'INNER JOIN CLIENTS C ON C.id = UC.client_id ' +
          'WHERE UC.user_id = U.id), "</li></ul>") clients, ' +

          '(SELECT COUNT(C.id) ' +
          'FROM USERS_CLIENTS UC ' +
          'INNER JOIN CLIENTS C ON C.id = UC.client_id ' +
          'WHERE UC.user_id = U.id) clients_count ' +

          'FROM USERS U ' +
          'LEFT JOIN AREAS A ON U.locate_area = A.id ' +
          'LEFT JOIN OFFICES O ON A.office_id = O.id ' +
          'LEFT JOIN CLIENTS C ON O.client_id = C.id ' +
          'WHERE 1 ',
        countQuery = 'SELECT COUNT(u.ID) AS COUNTER FROM USERS U WHERE 1 ',
        commonQuery = 'AND U.STATUS >= 1 ',
        dataParams = [],
        countParams = [],
        name;

    // Set order expression
    if (req.query.sort) {
      filter.orderBy = 'u.' + req.query.sort + ' ' + req.query.sort_dir;
    }

    if (filter.name) {
      name = '%' + filter.name.replace(/ /g, '%') + '%';

      commonQuery += 'AND (CONCAT_WS(" ", U.NAME, U.LAST_NAME) LIKE ? ';
      commonQuery += 'OR U.USERNAME LIKE ?) ';
      dataParams.push(name, name);
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
      dataQuery += 'U.ID ASC ';
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
        res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
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
    var usernameLowerCase = req.body.username.toLowerCase().trim();

    db.beginTransaction(function (err) {
      if (err) { throw err;}

      db.query('select * from users where username = ?', [usernameLowerCase], function (err, rows) {
        var query,
            userClientQuery = [],
            userClientQueryParams = [],
            uCQueries = '',
            uEntities = [],
            uEQueries = '',
            queryParams;

        if (rows && rows.length) {
          printLog(err);
          res
            .status(422) // unprocessable entity
            .json({error: 422, message: 'El nombre de usuario no está disponible.'});
        } else {
          query = 'INSERT INTO USERS SET ?';

          queryParams = {
            username: usernameLowerCase,
            name: req.body.name,
            last_name: req.body.last_name,
            password: req.body.password,
            status: req.body.status,
            role_id: req.body.role_id,
            locate_area: req.body.locate_area,
            created_at: new Date()
          };

          if (req.body.legacy_id) {
            queryParams.legacy_id = req.body.legacy_id;
          }
          // Insert USER data
          db.query(query, [queryParams], function (err, result) {
            var userID;

            if (err) {
              printLog(err);
              res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
              return db.rollback(function () {
                throw err;
              });
            }

            userID = result.insertId;
            // Insert allowed Clients
            if (req.body.clients && req.body.clients.length) {
              req.body.clients.forEach(function (item) {
                if (item.selected === true) {
                  userClientQuery.push(' INSERT into USERS_CLIENTS SET user_id = ? , client_id = ? ; ');
                  userClientQueryParams.push(userID);
                  userClientQueryParams.push(item.id); // CLIENT ID
                }
              });

              if (userClientQuery.length) {
                uCQueries = userClientQuery.join('');
              }
            }

            // Insert restrictions
            if (req.body.entities && req.body.entities.length) {
              uEQueries = ' delete from RESTRICTIONS where user_id = ? ;';
              userClientQueryParams.push(userID);

              req.body.entities.forEach(function (item) {
                uEntities.push(' INSERT INTO RESTRICTIONS ' +
                  '(entity_id, user_id, _view, _create, _edit, _delete) values (?,?,?,?,?,?); ');

                userClientQueryParams.push(item.id);
                userClientQueryParams.push(userID);
                userClientQueryParams.push(item._view || 0);
                userClientQueryParams.push(item._create || 0);
                userClientQueryParams.push(item._edit || 0);
                userClientQueryParams.push(item._delete || 0);
              });
              // Remove previous restrictions
              uEQueries += uEntities.join('');
            }
            // Insert restrictions and clients
            db.query(uCQueries + uEQueries, userClientQueryParams, function (err) {
              if (err) {
                printLog(err);
                res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
                return db.rollback(function () {
                  throw err;
                });
              } else {
                // Save transaction
                db.commit(function (err) {
                  if (err) { return db.rollback(function () { throw err; }); }
                  res.status(201) // new resource was created
                    .json({results:{code:1, message: 'ok', data: req.body}});
                });
              }
            });
          });
        }
      });
    });
  });

// Used In profile feature , password type
rutas.route('/profile/password')
  .put(function (req, res) {
    'use strict';
    var query = 'UPDATE USERS SET ' +
        ' password = "' + req.body.password + '"  ' +
        ' where id = ' + req.user.id;

    if (req.body.oldPassword !== req.user.password) {
      res.status(200).send({code: 200, message: 'Su clave actual no coincide'});
      return;
    }

    db.query(query, function (err) {
      if (err) {
        printLog(err);
        res
          .status(500)
          .send({code: 500, message: 'Internal Server Error', dev: err, sql: query});
        return;
      }

      // Update current password
      req.user.password = req.body.password;
      res.json({results:{code: '001', message: 'ok', data: req.body}});
    });
  });
// Routes for Users Feature
rutas.route('/:id')
  .get(function (req, res) {
    'use strict';
    var user,
        query = 'SELECT U.id, U.name, U.last_name, U.status, U.role_id, U.legacy_id, U.employee_id, ' +
          'U.username, O.client_id locate_client, O.id locate_office, A.id locate_area ' +
          'FROM USERS U ' +
          'LEFT JOIN AREAS A ON U.locate_area = A.ID ' +
          'LEFT JOIN OFFICES O ON A.OFFICE_ID = O.ID ' +
          'WHERE U.ID = ' + req.params.id + ';',
        CQuery, // client query
        RQuery; // restriction query

    // Add user_clients into the user json
    CQuery = 'SELECT c.id, c.description, IF(uc.id, true, null) selected  ' +
      ' from CLIENTS c  ' +
      ' left join USERS_CLIENTS uc on uc.client_id = c.id and uc.status = 1 and uc.user_id = ' + req.params.id +
      ' where c.status = 1;';

    // Add entity restrictions
    RQuery = 'SELECT e.id, e.`name`, e.display_name, r._view, r._create, r._edit, r._delete ' +
      'from ENTITIES e  ' +
      'left join RESTRICTIONS r on r.entity_id = e.id and r.user_id = ' + req.params.id;

    db.query(query + CQuery + RQuery, function (err, results) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
        return;
      }

      user = results[0][0];
      user.clients = results[1];
      user.entities = results[2];
      res.json(user);

    });
  })
  .put(function (req, res) {
    'use strict';

    var usernameLowerCase = req.body.username.toLowerCase().trim(),
        verifyUsernameQuery = 'select count (*) total from USERS ' +
        'where username = ? and id <> ' + req.params.id,
        query = 'UPDATE USERS SET ? where id = ? ; ' +
          'delete from USERS_CLIENTS where user_id = ?;', // Remove all rows related to add new ones
        userClientQuery = [],
        uCQueries = '',
        uEntities = [],
        uEQueries = '',
        queryParams,
        queryWhereParam = req.params.id;

    queryParams = {
      username: usernameLowerCase,
      name: req.body.name,
      last_name: req.body.last_name,
      status: req.body.status,
      role_id: req.body.role_id,
      locate_area: req.body.locate_area
    };

    if (req.body.legacy_id) {
      queryParams.legacy_id = req.body.legacy_id;
    }


    // Insert allowed Clients
    if (req.body.clients && req.body.clients.length) {
      req.body.clients.forEach(function (item) {
        if (item.selected === true) {
          userClientQuery.push('insert into USERS_CLIENTS SET ' +
            '   user_id = ' + req.params.id +
            ' , client_id = ' + item.id);
        }
      });

      if (userClientQuery.length) {
        uCQueries = userClientQuery.join(';');
        uCQueries += ';';
      }
    }

    // Insert restrictions
    if (req.body.entities && req.body.entities.length) {
      req.body.entities.forEach(function (item) {
        uEntities.push('insert into RESTRICTIONS set ' +
          ' entity_id =' + item.id +
          ' , user_id =' + req.params.id +
          ' , _view = ' + (item._view || 0) +
          ' , _create = ' + (item._create || 0) +
          ' , _edit = ' + (item._edit || 0) +
          ' , _delete = ' + (item._delete || 0) + '');
      });
      // Remove previous restrictions
      uEQueries = ' delete from RESTRICTIONS where user_id = ' + req.params.id + ';'
        + uEntities.join(';');
    }

    db.query(verifyUsernameQuery, [usernameLowerCase], function (err, rows) {
      var existUsername = rows[0].total > 0;

      if (existUsername) {
        res.status(422).send({code: 422, message: 'El nombre de usuario ya existe', dev: err});
      } else {
        db.query(query + uCQueries + uEQueries, [queryParams, queryWhereParam, queryWhereParam], function (err) {
          if (err) {
            printLog(err);
            res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
            return;
          }

          if (req.user.id == req.params.id) {
            // Update current username
            req.user.username = usernameLowerCase;
          }

          res
            .status(204)
            .json({results:{code:1, message: 'ok', data: req.body}});
        });
      }
    });
  })
  .delete(function (req, res) {
    'use strict';
    var id = req.params.id,
        user = {
          // Set default values
          updated_at: new Date(),
          status: -1,
          updated_by: req.user && req.user.id || -1
        };

    if (req.user.id == id) {
      res.status(401).json({results: {code:'error', message: 'Acción prohibida'}});
      return;
    }

    db.query('UPDATE USERS SET ? WHERE ID = ?;', [user, id], function (err) {
      if (err) {
        printLog(err);
        res.status(500).send({code: 500, message: 'Internal Server Error', dev: err});
        return;
      }

      res.json({result: {code: '001', message: 'ok'}});
    });
  });

// Routes for Users Feature, password tab
rutas.route('/:id/password')
  .put(function (req, res) {
    'use strict';
    var query = 'UPDATE USERS SET  password = ? where id = ?',
        queryParams = [req.body.password, req.params.id];

    db.query(query, queryParams, function (err) {
      if (err) {
        printLog(err);
        res
          .status(500)
          .send({code: 500, message: 'Internal Server Error', dev: err, sql: query});
        return;
      }

      if (req.user.id == req.params.id) {
        // Update current username
        req.user.password = req.body.password;
      }

      res.json({results: {code: '001', message: 'ok', data: req.body}});
    });
  });

module.exports = rutas;
