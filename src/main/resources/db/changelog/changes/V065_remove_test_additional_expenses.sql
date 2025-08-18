--liquibase formatted sql

--changeset author:system:remove_test_additional_expenses
DELETE FROM additional_expenses WHERE supplier_proposal_id = '00000000-0000-0000-0000-000000000000';
