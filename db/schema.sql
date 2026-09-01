-- players table schema

create table public.players (
  id uuid not null default gen_random_uuid (),
  name text not null,
  role text null,
  batting_hand text not null default 'Right' check (batting_hand = any (array['Right'::text, 'Left'::text])),
  bowling_hand text not null default 'Right' check (bowling_hand = any (array['Right'::text, 'Left'::text])),
  bowling_style text not null default 'Medium' check (bowling_style = any (array['Fast'::text, 'Fast-medium'::text, 'Medium-fast'::text, 'Medium'::text, 'Off spin'::text, 'Leg spin'::text])),
  created_at timestamp without time zone null default now(),
  constraint players_pkey primary key (id),
  constraint players_role_check check (
    (
      role = any (
        array[
          'Batsman'::text,
          'Bowler'::text,
          'All-rounder'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

-- Migration for existing databases: assign defaults to existing players
-- alter table public.players add column if not exists batting_hand text not null default 'Right' check (batting_hand = any (array['Right'::text, 'Left'::text]));
-- alter table public.players add column if not exists bowling_hand text not null default 'Right' check (bowling_hand = any (array['Right'::text, 'Left'::text]));
-- alter table public.players add column if not exists bowling_style text not null default 'Medium' check (bowling_style = any (array['Fast'::text, 'Fast-medium'::text, 'Medium-fast'::text, 'Medium'::text, 'Off spin'::text, 'Leg spin'::text]));

create trigger on_player_created
after INSERT on players for EACH row
execute FUNCTION create_computed_stats ();

-- score_entries table schema

create table public.score_entries (
  id uuid not null default gen_random_uuid (),
  player_id uuid null,
  match_date date not null default CURRENT_DATE,
  match_label text not null,
  runs integer null default 0,
  balls_faced integer null default 0,
  singles integer null default 0,
  doubles integer null default 0,
  triples integer null default 0,
  fours integer null default 0,
  sixes integer null default 0,
  how_out text null default 'Not Out'::text,
  not_out boolean null default true,
  overs_bowled numeric(4, 1) null default 0,
  runs_given integer null default 0,
  wickets integer null default 0,
  maidens integer null default 0,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null default now(),
  constraint score_entries_pkey primary key (id),
  constraint score_entries_player_id_match_date_match_label_key unique (player_id, match_date, match_label),
  constraint score_entries_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_score_change
after INSERT
or DELETE
or
update on score_entries for EACH row
execute FUNCTION trigger_recalculate ();

-- computed_stats table schema

create table public.computed_stats (
  id uuid not null default gen_random_uuid (),
  player_id uuid null,
  total_runs integer null default 0,
  total_wickets integer null default 0,
  batting_avg numeric(6, 2) null default 0,
  strike_rate numeric(6, 2) null default 0,
  bowling_avg numeric(6, 2) null default 0,
  economy numeric(6, 2) null default 0,
  highest_score integer null default 0,
  best_figures text null default '0/0'::text,
  games_played integer null default 0,
  last_updated timestamp without time zone null default now(),
  constraint computed_stats_pkey primary key (id),
  constraint computed_stats_player_id_key unique (player_id),
  constraint computed_stats_player_id_fkey foreign KEY (player_id) references players (id) on delete CASCADE
) TABLESPACE pg_default;