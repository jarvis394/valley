ALTER TABLE "projects" ADD COLUMN "heading_font" text DEFAULT 'Museo Sans Cyrl' NOT NULL;
ALTER TABLE "projects" ADD COLUMN "cover_variant" integer DEFAULT 2 NOT NULL;
ALTER TABLE "projects" ADD COLUMN "gallery_orientation" integer DEFAULT 1 NOT NULL;
ALTER TABLE "projects" ADD COLUMN "gallery_spacing" integer DEFAULT 1 NOT NULL;
ALTER TABLE "projects" ADD COLUMN "gallery_theme" text DEFAULT 'system' NOT NULL;