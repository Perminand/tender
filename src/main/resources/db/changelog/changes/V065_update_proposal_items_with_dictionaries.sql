-- Обновление таблицы proposal_items для связи со справочниками

-- Добавление внешних ключей для связи со справочниками
ALTER TABLE proposal_items ADD COLUMN brand_id UUID;
ALTER TABLE proposal_items ADD COLUMN manufacturer_id UUID;
ALTER TABLE proposal_items ADD COLUMN country_of_origin_id UUID;
ALTER TABLE proposal_items ADD COLUMN warranty_id UUID;

-- Добавление ограничений внешних ключей
ALTER TABLE proposal_items ADD CONSTRAINT fk_proposal_items_brand 
    FOREIGN KEY (brand_id) REFERENCES brands(id);

ALTER TABLE proposal_items ADD CONSTRAINT fk_proposal_items_manufacturer 
    FOREIGN KEY (manufacturer_id) REFERENCES manufacturers(id);

ALTER TABLE proposal_items ADD CONSTRAINT fk_proposal_items_country 
    FOREIGN KEY (country_of_origin_id) REFERENCES countries(id);

ALTER TABLE proposal_items ADD CONSTRAINT fk_proposal_items_warranty 
    FOREIGN KEY (warranty_id) REFERENCES warranties(id);

-- Удаление старых текстовых полей (после миграции данных)
-- ALTER TABLE proposal_items DROP COLUMN brand;
-- ALTER TABLE proposal_items DROP COLUMN manufacturer;
-- ALTER TABLE proposal_items DROP COLUMN country_of_origin;
-- ALTER TABLE proposal_items DROP COLUMN warranty; 