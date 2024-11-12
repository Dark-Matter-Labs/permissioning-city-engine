-- migration 1730881273648_change-response-summary-to-resolve-details-in-permission-request

ALTER TABLE permission_request RENAME COLUMN response_summary TO resolve_details;
