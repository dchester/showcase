# Flight CMS

Custom content types and fields with a JSON API

## Getting Started

Flight requires Node.js and a MySQL, Postgres, or SQLite database.

Clone the repository and install dependencies:

```bash
$ git clone https://github.com/dchester/flight-cms.git
$ cd flight-cms
$ npm install
```

Edit your database configuration in `config/default.json`:

```json
{
  "database": {
    "dialect": "mysql",
    "host": "localhost",
    "database": "cms",
    "username": "cms",
    "password": "cms"
  },
  "files": {
    "tmp_path": "/var/tmp",
    "storage_path": "/var/tmp"
  }
}
```

Set up the database schema:
```
$ node app.js schema-sync
```

Then start your server:

```
$ PORT=4000 node app.js run
Server listening on port 4000...
```

## Collections

Once the server is up and running, start by creating a new collection.  A collection is a set of like items.  Other CMSs might call a collection a "content type" or "custom post type".  In a relational database, a collection would be analogous to a table.  Define a collection and its fields, and then use the admin interface to add items.  

## REST API

Access and modify data in collections through the built-in RESTful API.  Visit `/admin/api` in a running instance to see details for each collection.

## Configuration

This project uses [config](https://github.com/lorenwest/node-config).  Find configuration files under `config/`.

##### Database

Specify database connection details under the `database` key:

- `dialect` can be `mysql`, `postgres`, or `sqlite`
- `storage` specifies the file on disk for the `sqlite` dialect
- `host`, `database`, `username`, and `password` are relevant connection parameters

Under the hood these are sent through to the [Sequelize constructor](http://sequelizejs.com/documentation#usage-options).

##### Files

- `tmp_path` specifies where incoming uploaded files should be stored during transfer
- `storage_path` specifies long term storage where uploaded files should reside

## License

Copyright (c) 2013 David Chester <david@fmail.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
