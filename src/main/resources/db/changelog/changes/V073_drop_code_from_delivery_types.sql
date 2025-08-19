--liquibase formatted sql

--changeset author:system:drop_code_from_delivery_types
--preconditions onFail:CONTINUE onError:CONTINUE
--precondition-sql-check expectedResult:1 SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'delivery_types' AND column_name = 'code'
ALTER TABLE delivery_types DROP COLUMN code;


