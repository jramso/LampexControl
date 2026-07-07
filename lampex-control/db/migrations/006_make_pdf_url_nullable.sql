-- db/migrations/006_make_pdf_url_nullable.sql
-- Tornar o campo arquivo_pdf_url opcional (nullable) na tabela registro_semanal

ALTER TABLE registro_semanal ALTER COLUMN arquivo_pdf_url DROP NOT NULL;
