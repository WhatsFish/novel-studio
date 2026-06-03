-- novel-studio schema. Manages a long-form novel: outline, chapters,
-- characters, settings/wiki, economy & power systems, foreshadowing.
-- Idempotent-ish: uses IF NOT EXISTS so re-applying is safe.

-- ---------- Structure: volumes -> arcs -> chapters ----------

CREATE TABLE IF NOT EXISTS volumes (
  id          serial PRIMARY KEY,
  ord         integer NOT NULL DEFAULT 0,     -- display order (卷序)
  title       text    NOT NULL,
  theme       text    DEFAULT '',             -- 主题 / scope
  scope       text    DEFAULT '',             -- 格局层 (个人/隐藏社会/...)
  summary     text    DEFAULT '',             -- 卷梗概
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS arcs (
  id            serial PRIMARY KEY,
  volume_id     integer REFERENCES volumes(id) ON DELETE CASCADE,
  ord           integer NOT NULL DEFAULT 0,
  title         text    NOT NULL,             -- 剧情块标题
  function      text    DEFAULT '',           -- 该块的功能
  chapter_range text    DEFAULT '',           -- e.g. "1-6"
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- chapter status lifecycle
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chapter_status') THEN
    CREATE TYPE chapter_status AS ENUM ('outline','draft','review','final');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS chapters (
  id          serial PRIMARY KEY,
  number      integer NOT NULL,               -- 章号 (global)
  title       text    NOT NULL DEFAULT '',
  volume_id   integer REFERENCES volumes(id) ON DELETE SET NULL,
  arc_id      integer REFERENCES arcs(id)    ON DELETE SET NULL,
  status      chapter_status NOT NULL DEFAULT 'outline',
  pov         text    DEFAULT '',             -- 视角
  outline     text    DEFAULT '',             -- 细纲
  content     text    DEFAULT '',             -- 正文
  word_count  integer GENERATED ALWAYS AS (char_length(content)) STORED,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS chapters_number_key ON chapters(number);

-- ---------- Characters & relationships ----------

CREATE TABLE IF NOT EXISTS characters (
  id                serial PRIMARY KEY,
  name              text NOT NULL,
  aliases           text DEFAULT '',
  faction           text DEFAULT '',          -- 寄居者/人类/旧族/新难民/守界者
  status            text DEFAULT '',           -- alive/dead/...
  bio               text DEFAULT '',           -- 小传
  secret            text DEFAULT '',           -- 秘密
  arc               text DEFAULT '',           -- 人物弧
  first_appearance  integer,                   -- chapter number
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relationships (
  id            serial PRIMARY KEY,
  from_id       integer REFERENCES characters(id) ON DELETE CASCADE,
  to_id         integer REFERENCES characters(id) ON DELETE CASCADE,
  kind          text NOT NULL DEFAULT '',       -- 宿主共生/夫妻/敌对/同类...
  description   text DEFAULT ''
);

-- ---------- Settings / worldbuilding wiki ----------

CREATE TABLE IF NOT EXISTS settings (
  id          serial PRIMARY KEY,
  category    text NOT NULL DEFAULT '世界观',   -- 世界观/地点/组织/概念/历史
  title       text NOT NULL,
  body        text DEFAULT '',
  ord         integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Foreshadowing (the F-table) ----------

CREATE TABLE IF NOT EXISTS foreshadows (
  id              serial PRIMARY KEY,
  code            text NOT NULL,               -- F1, F2, ...
  description     text NOT NULL,
  planted_where   text DEFAULT '',             -- e.g. 卷一第3章
  payoff_where    text DEFAULT '',             -- e.g. 卷三大反转
  status          text NOT NULL DEFAULT 'planted', -- planted/paid
  purpose         text DEFAULT '',
  ord             integer NOT NULL DEFAULT 0
);

-- ---------- Plot lines (三线) ----------

CREATE TABLE IF NOT EXISTS plotlines (
  id          serial PRIMARY KEY,
  name        text NOT NULL,                   -- 真相线/力量线/羁绊线
  kind        text DEFAULT '',
  description text DEFAULT '',
  ord         integer NOT NULL DEFAULT 0
);

-- ---------- Economy: 魂晶 system ----------

CREATE TABLE IF NOT EXISTS economy (
  id          serial PRIMARY KEY,
  name        text NOT NULL,                   -- 用途/项目
  category    text DEFAULT '',                 -- 燃料/货币/罗盘/获取途径
  rule        text DEFAULT '',                 -- 规则描述
  value       text DEFAULT '',                 -- 数值(可空,后期定)
  notes       text DEFAULT '',
  ord         integer NOT NULL DEFAULT 0
);

-- ---------- Power system: 精神力分级 ----------

CREATE TABLE IF NOT EXISTS power_levels (
  id            serial PRIMARY KEY,
  tier          text NOT NULL,                 -- 一阶·感 ...
  name          text DEFAULT '',
  abilities     text DEFAULT '',
  cost          text DEFAULT '',               -- 魂晶消耗
  prerequisite  text DEFAULT '',
  ord           integer NOT NULL DEFAULT 0
);

-- ---------- Cross-reference link tables (the value: connect chapters to everything) ----------

CREATE TABLE IF NOT EXISTS chapter_characters (
  chapter_id    integer REFERENCES chapters(id)   ON DELETE CASCADE,
  character_id  integer REFERENCES characters(id) ON DELETE CASCADE,
  PRIMARY KEY (chapter_id, character_id)
);

CREATE TABLE IF NOT EXISTS chapter_foreshadows (
  chapter_id    integer REFERENCES chapters(id)    ON DELETE CASCADE,
  foreshadow_id integer REFERENCES foreshadows(id) ON DELETE CASCADE,
  role          text DEFAULT 'plant',  -- plant/payoff/touch
  PRIMARY KEY (chapter_id, foreshadow_id, role)
);

CREATE TABLE IF NOT EXISTS chapter_plotlines (
  chapter_id    integer REFERENCES chapters(id)  ON DELETE CASCADE,
  plotline_id   integer REFERENCES plotlines(id) ON DELETE CASCADE,
  PRIMARY KEY (chapter_id, plotline_id)
);

-- updated_at trigger
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$ LANGUAGE plpgsql;

DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['volumes','arcs','chapters','characters','settings']) LOOP
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_touch_' || t) THEN
      EXECUTE format('CREATE TRIGGER trg_touch_%I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at();', t, t);
    END IF;
  END LOOP;
END $$;
