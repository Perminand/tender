--liquibase formatted sql

--changeset author:system:add_unique_contractitem_tenderitem
ALTER TABLE contract_items
    ADD CONSTRAINT uq_contract_items_contract_tender_item UNIQUE (contract_id, tender_item_id);


