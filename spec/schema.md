### Collections

Different types of entities or models

```
- title
- description
- name
- workspace_handle  fk=workspaces.handle
```

### Collection Fields

Possible fields or attributes an entity might have

```
- collection_id
- title
- name
- data_type
- description
- is_required   boolean
- index         integer
- meta          text
```

### Items

Instances of entities; records

```
- collection_id
- status_id
- key          nullable
- create_time  default=now
- update_time  default=now
```

### Statuses

```
- name
```

### Item Data

Data comprising the item record

```
- item_id
- data             text
- content_type
- user_id
```

### Item Data Revisions

Data comprising the item record

```
- item_id
- data             text
- content_type
- create_time      default=now
- user_id
```

### Files

Uploaded files associated with items

```
- item_id     nullable
- path
- original_filename  nullable
- description        nullable
- content_type
- meta_json          text,nullable
- size               integer
```

### Users

```
- username          unique
- is_superuser      boolean
- external_user_id  nullable
```
### Permissions

```
- name
```

### Workspace User Permissions

```
- user_id
- workspace_handle
- permission_id
```

### Workspaces

```
- title
- handle
- description
```


