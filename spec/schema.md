### Entities

Different types of entities or models

```
- title
- description
- name
- workspace_handle  fk=workspaces.handle
```

### Entity Fields

Possible fields or attributes an entity might have

```
- entity_id
- title
- name
- data_type
- description
- is_required   boolean
- index         integer
```

### Field Constraints

Constraints on fields, such as being required

```
- entity_field_id
- constraint_id
```

### Constraints

Possible constraints on fields

```
- name
- description
- error_text
```

### Entity Items

Instances of entities; records

```
- entity_id
- status       enum=(draft|published|deleted)
- create_time  default=now
- update_time  default=now
```

### Entity Item Data

Data comprising the item record

```
- entity_item_id
- data             text
- content_type
```

### Files

Uploaded files associated with items

```
- entity_item_id     nullable
- path
- original_filename  nullable
- description        nullable
- content_type
- meta_json          text,nullable
- size               integer
```

### Users

```
- username
- external_user_id  nullable
```

### User Entity Permissions

```
- user_id
- entity_id
- permission  enum=(editor|viewer|no_access)
```

### Workspaces

```
- title
- handle
- description
```


