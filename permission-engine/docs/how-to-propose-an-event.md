
# How to propose an event

## Basic procedure

- collect the final params for each ruleBlock creation and create them in the last step before creating the rule with the created ruleBlocks

1. Collect params for ruleBlock creation while proceeding the event proposal form
1. Create all ruleBlocks with `POST`-`/api/v1/rule/block` api
1. Then create an event rule with `POST`-`/api/v1/rule` api
1. Then create an event with `POST`-`/api/v1/event` api
1. Then create a permission request with `POST`-`/api/v1/permission/request/event` api

## Step by step description

### Themes

- `GET`-`/api/v1/topic`

### Set Date and Time

- `GET`-`/api/v1/space/{id}/availability`: get availability items for the space

### Require equipments

- `GET`-`/api/v1/space/equipment`: get available equipment list for the space
- Prepare for `POST`-`/api/v1/rule/block`
  - use `space_event:require_equipment` `type` for requesting space equipment usage
- Collect `startAt` and `duration` parameter here for `POST`-`/api/v1/event` api to create event

### Browse event templates

- `GET`-`/api/v1/space/matched-rule`: get all matched event rules by condition that had been approved by the space permissioners
- `GET`-`/api/v1/space/approved-rule`: get all event rules that had been approved by the space permissioners
  - use `sortBy=popularity` param to sort the event rules by popularity
  - use `sortBy=timeDesc` param to sort the event rules by newest items

### Review space rule part of the template

- `GET`-`/api/v1/rule/{id}`: use `Space.ruleId` for `{id}` param to get space's Rule object with ruleBlocks
- Prepare for `POST`-`/api/v1/rule/block`
  - use `space_event:access` `type` for selecting event type: `public:free`, `public:paid`, `private:free`, `private:paid`
  - use `space_event:expected_attendee_count` `type` for describing expected attendee count
  - use `space_event:noise_level` `type` for describing noise level
  - use `space_event:pre_permission_check_answer` `type` for answering space rule's pre permission check questions
  - use `space_event:exception` `type` for raising exception against a space rule's ruleBlock

### Add a custom rule

- Prepare for `POST`-`/api/v1/rule/block`
  - use `space_event:general` `type` for creating general rule block for event
  - use `space_event:benefit` `type` for describing one of the benefits of the event
  - use `space_event:risk` `type` for describing one of the risks of the event

### Self-risk assesment and insurance

- Prepare for `POST`-`/api/v1/rule/block`
  - use `space_event:self_risk_assesment` `type` for describing self risk assesment
  - use `space_event:insurance` `type` for attaching insurance file in pdf

### Proposal Final review

1. Create all ruleBlocks with `POST`-`/api/v1/rule/block` api
1. Then create an event rule with `POST`-`/api/v1/rule` api
1. Then create an event with `POST`-`/api/v1/event` api
1. Then create a permission request with `POST`-`/api/v1/permission/request/event` api
