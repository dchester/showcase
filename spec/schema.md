### Entities

Different types of entities or models

```
- title
- description
- name
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
- index         int
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
- active_status  nullable
- create_time    default=now
- update_time    default=now
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

