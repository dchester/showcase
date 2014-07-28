# Showcase

Lightweight pluggable CMS in Node.js with a RESTful API

## Getting Started

Create `app.js` for your project:

```javascript
var showcase = require('showcase');

showcase.initialize({
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
  },
  "port": 3000
});

showcase.run();
```

Initialize the database schema:

```
$ node --harmony-generators app schema-sync
```

Initialize the application fixtures data:

```
$ node --harmony-generators app fixtures-sync
```

Start your server:

```
$ PORT=4000 node --harmony-generators app run
```

Once your app is running, create an admin user and log in.  Then create a workspace, then create some collections, and start adding items.

> Node version 0.11.3 is recommended.  Showcase requires support for ES6 generators, so node v0.11.2 or greater.  You may also try your luck with [gnode](https://github.com/TooTallNate/gnode) and node v0.10.x.  Also note that if you need sqlite support, node v0.11.3 is the latest supported version of node for that library.


## Workspaces, Collections, and Items

Start by creating a new workspace.  A workspace can have an administrator, and will contain a set of collections.  You may often want to create a workspace per website, or per project.

Within a workspace, create collections.  A collection is a set of like items.  Other CMSs might call a collection a "content type" or "custom post type".  In a relational database, a collection would be analogous to a table.  Define a collection and its fields, and then use the admin interface to add items.  

Access and modify data in collections through the built-in RESTful API.

## Showcase API

### showcase.initialize(options)

Initialize the application, given a set of options:

Sepcify authentication and authorization parameters under the `auth` key:

- `auth.passport_strategy` specifies an instance of a [passport](http://passportjs.org) strategy; defaults to local authentication

Specify database connection details under the `database` key:

- `database.dialect` can be `mysql`, `postgres`, or `sqlite`
- `database.storage` specifies the file on disk for the `sqlite` dialect
- `database.host` specifies the database connection host
- `database.port` specifies the database connection port
- `database.database` specifies the database database name
- `database.username` sepcifies the database username
- `database.password` specifies the database password
- `database.logging` is a boolean to specify whether to log each database query
- `database.define` is a passthrough to Sequelize's default model definitions for any extra customization

Under the hood these are sent through to the [Sequelize constructor](http://sequelizejs.com/documentation#usage-options).

- `files.tmp_path` specifies where incoming uploaded files should be stored during transfer
- `files.storage_path` specifies long term storage where uploaded files should reside
- `files.store` specifies a function to store an uploaded file; defaults writing to `files.storage_path`
- `files.retrieve` specifies a function to retrieve a stored file
- `files.public_url` specifies a function to generate a public url for a stored file
- `files.name` specifies a function to generate a filename for an uploaded file

By default files will be stored directly to `files.storage_path`, but you may override this functionality by specifying override methods to `store` and `retrieve`, etc.  These override methods take a callback as a parameter and are bound to `File` instances. See `examples/files.js` for an example.

And other various top-level configuration options:

- `port` specifies the TCP port to listen on
- `secret` specifies the secret used to hash session data (anything random enough will do)

### showcase.registerField(field)

Register a custom field.  Supplied `field` should be an object specifying the following keys:

##### field.config

An object containing configuration information for the field.  Specify the following options:

- `name` - name of the custom field type
- `inflate` - function to populate item value from stored field data; accepts `field`, `data`, `models`, and `callback` parameters
- `preview` - function to provide a lightweight preview of the data for rendering in HTML lists; accepts a `data` parameter containing the stored data
- `validator` - function to validate input

##### field.style

A string containing CSS to style field elements

##### field.script

A string containing JavaScript library code to be executed on forms containing this field

##### field.template

A Swig template for rendering the form field

### showcase.run()

Start up the server.  Specify the HTTP port either via a `PORT` environment variable, or through a `port` key in options sent to `showcase.initialize`.

## Events

Subscribe to change events through `showcase.radio`, an event emitter.  For example to log changes to items:

```javascript
showcase.radio.on('itemUpdate', function(item) {
    console.log("item was updated ", item);
})
```

##### itemUpdate

Fires when an item is updated.  Receives the updated item as a parameter.  

##### itemCreate

Fires when an item is created.  Receives the nascent item as a parameter.

##### itemDestroy

Fires when at item is destroyed.  Receives the moribund item as a parameter.


## License

Copyright (c) 2013-2014 David Chester <david@fmail.co.uk>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
