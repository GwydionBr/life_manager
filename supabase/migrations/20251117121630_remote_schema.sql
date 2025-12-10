

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."amountUnits" AS ENUM (
    'kg',
    'g',
    't',
    'ml',
    'l',
    'amount'
);


ALTER TYPE "public"."amountUnits" OWNER TO "postgres";


CREATE TYPE "public"."cash_flow_type" AS ENUM (
    'expense',
    'income'
);


ALTER TYPE "public"."cash_flow_type" OWNER TO "postgres";


CREATE TYPE "public"."currency" AS ENUM (
    'USD',
    'EUR',
    'GBP',
    'CAD',
    'AUD',
    'JPY',
    'CHF',
    'CNY',
    'INR',
    'BRL',
    'VEF'
);


ALTER TYPE "public"."currency" OWNER TO "postgres";


CREATE TYPE "public"."finance_interval" AS ENUM (
    'day',
    'week',
    'month',
    '1/4 year',
    '1/2 year',
    'year'
);


ALTER TYPE "public"."finance_interval" OWNER TO "postgres";


COMMENT ON TYPE "public"."finance_interval" IS 'The interval of the recurring income or expense';



CREATE TYPE "public"."locales" AS ENUM (
    'en-US',
    'de-DE'
);


ALTER TYPE "public"."locales" OWNER TO "postgres";


CREATE TYPE "public"."roundingAmount" AS ENUM (
    's',
    'min',
    '1/4h',
    '1/2h',
    'h',
    'custom'
);


ALTER TYPE "public"."roundingAmount" OWNER TO "postgres";


COMMENT ON TYPE "public"."roundingAmount" IS 'The time fragment to round to';



CREATE TYPE "public"."roundingDirection" AS ENUM (
    'up',
    'down',
    'nearest'
);


ALTER TYPE "public"."roundingDirection" OWNER TO "postgres";


CREATE TYPE "public"."status" AS ENUM (
    'pending',
    'accepted',
    'declined'
);


ALTER TYPE "public"."status" OWNER TO "postgres";


CREATE TYPE "public"."timeSectionInterval" AS ENUM (
    '5min',
    '10min',
    '15min',
    '20min',
    '30min',
    '1h'
);


ALTER TYPE "public"."timeSectionInterval" OWNER TO "postgres";


CREATE TYPE "public"."weekdays" AS ENUM (
    'mon',
    'tue',
    'wed',
    'thu',
    'fri',
    'sat',
    'sun'
);


ALTER TYPE "public"."weekdays" OWNER TO "postgres";


COMMENT ON TYPE "public"."weekdays" IS 'All 7 days of the week';



CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email,
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url'
  );
  insert into public.settings (user_id)
  values (
    new.id
  );
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."appointment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reminder" timestamp with time zone,
    "end_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "timer_project_id" "uuid"
);


ALTER TABLE "public"."appointment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bank_account" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "currency" "public"."currency" NOT NULL,
    "saldo" double precision DEFAULT '0'::double precision NOT NULL,
    "saldo_set_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL
);


ALTER TABLE "public"."bank_account" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."finance_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_client" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "address" "text",
    "phone" "text",
    "email" "text",
    "currency" "public"."currency",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."finance_client" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_project" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "start_amount" double precision NOT NULL,
    "currency" "public"."currency" NOT NULL,
    "due_date" timestamp with time zone,
    "title" "text" NOT NULL,
    "finance_client_id" "uuid",
    "description" "text",
    "single_cash_flow_id" "uuid"
);


ALTER TABLE "public"."finance_project" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_project_adjustment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "amount" double precision NOT NULL,
    "description" "text",
    "finance_client_id" "uuid",
    "finance_project_id" "uuid" NOT NULL,
    "finance_category_id" "uuid",
    "single_cash_flow_id" "uuid"
);


ALTER TABLE "public"."finance_project_adjustment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_project_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "finance_category_id" "uuid" NOT NULL,
    "finance_project_id" "uuid" NOT NULL
);


ALTER TABLE "public"."finance_project_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_project_client" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finance_client_id" "uuid" NOT NULL,
    "finance_project_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."finance_project_client" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_rule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "percentage" double precision DEFAULT '0'::double precision NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "start_value" double precision DEFAULT '0'::double precision NOT NULL,
    "end_value" double precision
);


ALTER TABLE "public"."finance_rule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_rule_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finance_rule_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "finance_category_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."finance_rule_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."finance_rule_timer_project" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "finance_rule_id" "uuid" NOT NULL,
    "timer_project_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."finance_rule_timer_project" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."friendships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "requester_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "addressee_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" "public"."status" DEFAULT 'pending'::"public"."status" NOT NULL
);


ALTER TABLE "public"."friendships" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."grocery_item" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "amount" real DEFAULT '1'::real NOT NULL,
    "checked" boolean DEFAULT false NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "unit" "public"."amountUnits" DEFAULT 'amount'::"public"."amountUnits" NOT NULL,
    "group_id" "uuid" NOT NULL
);


ALTER TABLE "public"."grocery_item" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text",
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."group" OWNER TO "postgres";


COMMENT ON COLUMN "public"."group"."user_id" IS 'admin user of the group';



CREATE TABLE IF NOT EXISTS "public"."group_appointment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text",
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reminder" timestamp with time zone,
    "end_date" timestamp with time zone
);


ALTER TABLE "public"."group_appointment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_member" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "status" "public"."status" DEFAULT 'pending'::"public"."status" NOT NULL,
    "is_Admin" boolean DEFAULT false NOT NULL,
    "color" "text" DEFAULT '#40c057'::"text" NOT NULL
);


ALTER TABLE "public"."group_member" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."group_task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "exectution_date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "executed" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."group_task" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_payou_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "start_currency" "public"."currency" NOT NULL,
    "end_currency" "public"."currency",
    "start_value" numeric NOT NULL,
    "end_value" numeric,
    "cashflow_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "timer_project_id" "uuid",
    "finance_project_id" "uuid",
    "timer_session_project_id" "uuid"
);


ALTER TABLE "public"."old_payou_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payout" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "start_currency" "public"."currency" NOT NULL,
    "end_currency" "public"."currency",
    "start_value" numeric NOT NULL,
    "end_value" numeric,
    "cashflow_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "timer_project_id" "uuid",
    "finance_project_id" "uuid",
    "timer_session_project_id" "uuid"
);


ALTER TABLE "public"."payout" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "username" "text" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "website" "text",
    "email" "text" DEFAULT ''::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "initialized" boolean DEFAULT false NOT NULL,
    CONSTRAINT "profiles_username_check" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recurring_cash_flow" (
    "title" "text" NOT NULL,
    "amount" double precision NOT NULL,
    "description" "text" NOT NULL,
    "start_date" timestamp with time zone NOT NULL,
    "end_date" timestamp with time zone,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "interval" "public"."finance_interval" DEFAULT 'month'::"public"."finance_interval" NOT NULL,
    "type" "public"."cash_flow_type" DEFAULT 'expense'::"public"."cash_flow_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "category_id" "uuid",
    "finance_client_id" "uuid"
);


ALTER TABLE "public"."recurring_cash_flow" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recurring_cash_flow_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "recurring_cash_flow_id" "uuid" NOT NULL,
    "finance_category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."recurring_cash_flow_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."recurring_group_task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "group_id" "uuid" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "start_date" timestamp with time zone DEFAULT "now"() NOT NULL,
    "end_date" timestamp with time zone,
    "interval_days" bigint NOT NULL,
    "date_time" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."recurring_group_task" OWNER TO "postgres";


COMMENT ON TABLE "public"."recurring_group_task" IS 'This is a duplicate of group_task';



CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "default_currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "rounding_direction" "public"."roundingDirection" DEFAULT 'up'::"public"."roundingDirection" NOT NULL,
    "rounding_amount" "public"."roundingAmount" DEFAULT 'min'::"public"."roundingAmount" NOT NULL,
    "default_finance_currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "updated_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "rounding_custom_amount" bigint DEFAULT '5'::bigint NOT NULL,
    "default_salary_amount" double precision DEFAULT '0'::double precision NOT NULL,
    "default_group_color" "text" DEFAULT '#12b886'::"text",
    "default_project_hourly_payment" boolean DEFAULT true NOT NULL,
    "round_in_time_sections" boolean DEFAULT false NOT NULL,
    "time_section_interval" bigint DEFAULT '10'::bigint NOT NULL,
    "automaticly_stop_other_timer" boolean DEFAULT true NOT NULL,
    "locale" "public"."locales" DEFAULT 'en-US'::"public"."locales" NOT NULL,
    "show_calendar_time" boolean DEFAULT false NOT NULL,
    "format_24h" boolean DEFAULT true NOT NULL,
    "rounding_interval" integer DEFAULT 1 NOT NULL,
    "show_change_curreny_window" boolean
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."settings" IS 'The general Settings of a User which are for all devices.';



COMMENT ON COLUMN "public"."settings"."time_section_interval" IS 'in minutes';



CREATE TABLE IF NOT EXISTS "public"."single_cash_flow" (
    "amount" double precision NOT NULL,
    "date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."cash_flow_type" DEFAULT 'expense'::"public"."cash_flow_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "changed_date" timestamp with time zone,
    "recurring_cash_flow_id" "uuid",
    "category_id" "uuid",
    "finance_project_id" "uuid",
    "finance_client_id" "uuid"
);


ALTER TABLE "public"."single_cash_flow" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."single_cash_flow_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "single_cash_flow_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "finance_category_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL
);


ALTER TABLE "public"."single_cash_flow_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "exectution_date" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "executed" boolean DEFAULT false NOT NULL,
    "timer_project_id" "uuid"
);


ALTER TABLE "public"."task" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timer_project" (
    "title" "text" NOT NULL,
    "description" "text",
    "salary" double precision NOT NULL,
    "currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "is_favorite" boolean DEFAULT false NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "folder_id" "uuid",
    "order_index" bigint DEFAULT '0'::bigint NOT NULL,
    "hourly_payment" boolean DEFAULT true NOT NULL,
    "total_payout" numeric DEFAULT '0'::numeric NOT NULL,
    "cash_flow_category_id" "uuid",
    "color" "text",
    "rounding_interval" integer,
    "rounding_direction" "public"."roundingDirection",
    "time_fragment_interval" integer,
    "round_in_time_fragments" boolean,
    "finance_project_id" "uuid"
);


ALTER TABLE "public"."timer_project" OWNER TO "postgres";


COMMENT ON COLUMN "public"."timer_project"."title" IS 'Timer Project Name';



COMMENT ON COLUMN "public"."timer_project"."description" IS 'A Description for the Timer Project';



COMMENT ON COLUMN "public"."timer_project"."salary" IS 'The actual Timer Project Salary';



CREATE TABLE IF NOT EXISTS "public"."timer_project_category" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "timer_project_id" "uuid" NOT NULL,
    "finance_category_id" "uuid" NOT NULL
);


ALTER TABLE "public"."timer_project_category" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timer_project_folder" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "parent_folder" "uuid",
    "user_id" "uuid" DEFAULT "auth"."uid"(),
    "order_index" bigint DEFAULT '0'::bigint NOT NULL
);


ALTER TABLE "public"."timer_project_folder" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."timer_session" (
    "end_time" timestamp with time zone NOT NULL,
    "salary" double precision NOT NULL,
    "currency" "public"."currency" DEFAULT 'USD'::"public"."currency" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "active_seconds" bigint NOT NULL,
    "paused_seconds" bigint DEFAULT '0'::bigint NOT NULL,
    "project_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT ("now"() AT TIME ZONE 'utc'::"text") NOT NULL,
    "hourly_payment" boolean DEFAULT true NOT NULL,
    "paid" boolean DEFAULT false NOT NULL,
    "true_end_time" timestamp with time zone NOT NULL,
    "real_start_time" timestamp with time zone,
    "payout_id" "uuid",
    "memo" "text",
    "time_fragments_interval" integer,
    "single_cash_flow_id" "uuid"
);


ALTER TABLE "public"."timer_session" OWNER TO "postgres";


COMMENT ON COLUMN "public"."timer_session"."paid" IS 'bool weather the session is payed already or not';



ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment"
    ADD CONSTRAINT "appointment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bank_account"
    ADD CONSTRAINT "bank_account_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_category"
    ADD CONSTRAINT "cash_flow_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_client"
    ADD CONSTRAINT "client_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_rule"
    ADD CONSTRAINT "conditional_cash_flow_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "expense_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_project_category"
    ADD CONSTRAINT "finance_project_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_project_client"
    ADD CONSTRAINT "finance_project_client_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_project"
    ADD CONSTRAINT "finance_project_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_rule_category"
    ADD CONSTRAINT "finance_rule_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."finance_rule_timer_project"
    ADD CONSTRAINT "finance_rule_timer_project_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "generalUserSettings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."grocery_item"
    ADD CONSTRAINT "grocery_item_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_appointment"
    ADD CONSTRAINT "group_appointment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_member"
    ADD CONSTRAINT "group_member_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "group_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_task"
    ADD CONSTRAINT "group_task_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."recurring_cash_flow"
    ADD CONSTRAINT "recurringExpense_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_cash_flow_category"
    ADD CONSTRAINT "recurring_cash_flow_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recurring_group_task"
    ADD CONSTRAINT "recurring_group_task_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."single_cash_flow_category"
    ADD CONSTRAINT "single_cash_flow_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timer_project"
    ADD CONSTRAINT "timerProject_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timer_session"
    ADD CONSTRAINT "timerSession_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timer_project_folder"
    ADD CONSTRAINT "timer_project_category_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."timer_project_category"
    ADD CONSTRAINT "timer_project_category_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointment"
    ADD CONSTRAINT "appointment_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointment"
    ADD CONSTRAINT "appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_category"
    ADD CONSTRAINT "cash_flow_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_client"
    ADD CONSTRAINT "client_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule"
    ADD CONSTRAINT "conditional_cash_flow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_finance_client_id_fkey" FOREIGN KEY ("finance_client_id") REFERENCES "public"."finance_client"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_single_cash_flow_id_fkey" FOREIGN KEY ("single_cash_flow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_project_adjustment"
    ADD CONSTRAINT "finance_project_adjustment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_category"
    ADD CONSTRAINT "finance_project_category_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_category"
    ADD CONSTRAINT "finance_project_category_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_category"
    ADD CONSTRAINT "finance_project_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_client"
    ADD CONSTRAINT "finance_project_client_finance_client_id_fkey" FOREIGN KEY ("finance_client_id") REFERENCES "public"."finance_client"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_client"
    ADD CONSTRAINT "finance_project_client_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project_client"
    ADD CONSTRAINT "finance_project_client_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_project"
    ADD CONSTRAINT "finance_project_finance_client_id_fkey" FOREIGN KEY ("finance_client_id") REFERENCES "public"."finance_client"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_project"
    ADD CONSTRAINT "finance_project_single_cash_flow_id_fkey" FOREIGN KEY ("single_cash_flow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."finance_project"
    ADD CONSTRAINT "finance_project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_category"
    ADD CONSTRAINT "finance_rule_category_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_category"
    ADD CONSTRAINT "finance_rule_category_finance_rule_id_fkey" FOREIGN KEY ("finance_rule_id") REFERENCES "public"."finance_rule"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_category"
    ADD CONSTRAINT "finance_rule_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_timer_project"
    ADD CONSTRAINT "finance_rule_timer_project_finance_rule_id_fkey" FOREIGN KEY ("finance_rule_id") REFERENCES "public"."finance_rule"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_timer_project"
    ADD CONSTRAINT "finance_rule_timer_project_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."finance_rule_timer_project"
    ADD CONSTRAINT "finance_rule_timer_project_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_addressee_id_fkey" FOREIGN KEY ("addressee_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."friendships"
    ADD CONSTRAINT "friendships_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "generalUserSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."grocery_item"
    ADD CONSTRAINT "grocery_item_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_appointment"
    ADD CONSTRAINT "group_appointment_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_appointment"
    ADD CONSTRAINT "group_appointment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_member"
    ADD CONSTRAINT "group_member_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_member"
    ADD CONSTRAINT "group_member_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_task"
    ADD CONSTRAINT "group_task_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_task"
    ADD CONSTRAINT "group_task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "group_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_cashflow_id_fkey" FOREIGN KEY ("cashflow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_timer_session_project_id_fkey" FOREIGN KEY ("timer_session_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."old_payou_data"
    ADD CONSTRAINT "old_payou_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_cashflow_id_fkey" FOREIGN KEY ("cashflow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_timer_session_project_id_fkey" FOREIGN KEY ("timer_session_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payout"
    ADD CONSTRAINT "payout_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_cash_flow_category"
    ADD CONSTRAINT "recurring_cash_flow_category_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_cash_flow"
    ADD CONSTRAINT "recurring_cash_flow_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."finance_category"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recurring_cash_flow_category"
    ADD CONSTRAINT "recurring_cash_flow_category_recurring_cash_flow_id_fkey" FOREIGN KEY ("recurring_cash_flow_id") REFERENCES "public"."recurring_cash_flow"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_cash_flow_category"
    ADD CONSTRAINT "recurring_cash_flow_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_cash_flow"
    ADD CONSTRAINT "recurring_cash_flow_finance_client_id_fkey" FOREIGN KEY ("finance_client_id") REFERENCES "public"."finance_client"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."recurring_cash_flow"
    ADD CONSTRAINT "recurring_cash_flow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_group_task"
    ADD CONSTRAINT "recurring_group_task_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recurring_group_task"
    ADD CONSTRAINT "recurring_group_task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."single_cash_flow_category"
    ADD CONSTRAINT "single_cash_flow_category_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "single_cash_flow_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."finance_category"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."single_cash_flow_category"
    ADD CONSTRAINT "single_cash_flow_category_single_cash_flow_id_fkey" FOREIGN KEY ("single_cash_flow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."single_cash_flow_category"
    ADD CONSTRAINT "single_cash_flow_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "single_cash_flow_finance_client_id_fkey" FOREIGN KEY ("finance_client_id") REFERENCES "public"."finance_client"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "single_cash_flow_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "single_cash_flow_recurring_cash_flow_id_fkey" FOREIGN KEY ("recurring_cash_flow_id") REFERENCES "public"."recurring_cash_flow"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."single_cash_flow"
    ADD CONSTRAINT "single_cash_flow_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task"
    ADD CONSTRAINT "task_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project"
    ADD CONSTRAINT "timerProject_cash_flow_category_id_fkey" FOREIGN KEY ("cash_flow_category_id") REFERENCES "public"."finance_category"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timer_project"
    ADD CONSTRAINT "timerProject_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "public"."timer_project_folder"("id");



ALTER TABLE ONLY "public"."timer_project"
    ADD CONSTRAINT "timerProject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_session"
    ADD CONSTRAINT "timerSession_payout_id_fkey" FOREIGN KEY ("payout_id") REFERENCES "public"."payout"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timer_session"
    ADD CONSTRAINT "timerSession_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."timer_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project_category"
    ADD CONSTRAINT "timer_project_category_finance_category_id_fkey" FOREIGN KEY ("finance_category_id") REFERENCES "public"."finance_category"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project_category"
    ADD CONSTRAINT "timer_project_category_timer_project_id_fkey" FOREIGN KEY ("timer_project_id") REFERENCES "public"."timer_project"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project_folder"
    ADD CONSTRAINT "timer_project_category_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project_category"
    ADD CONSTRAINT "timer_project_category_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."timer_project"
    ADD CONSTRAINT "timer_project_finance_project_id_fkey" FOREIGN KEY ("finance_project_id") REFERENCES "public"."finance_project"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timer_project_folder"
    ADD CONSTRAINT "timer_project_folder_parent_folder_fkey" FOREIGN KEY ("parent_folder") REFERENCES "public"."timer_project_folder"("id");



ALTER TABLE ONLY "public"."timer_session"
    ADD CONSTRAINT "timer_session_single_cash_flow_id_fkey" FOREIGN KEY ("single_cash_flow_id") REFERENCES "public"."single_cash_flow"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."timer_session"
    ADD CONSTRAINT "timer_session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow update for group member" ON "public"."group_appointment" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "group_appointment"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable Update for group members" ON "public"."grocery_item" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "grocery_item"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable Update for group members" ON "public"."group_task" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable Update for group members" ON "public"."recurring_group_task" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "recurring_group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable delete for group members" ON "public"."grocery_item" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "grocery_item"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable delete for group members" ON "public"."group_task" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable delete for group members" ON "public"."recurring_group_task" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "recurring_group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable delete for included users" ON "public"."friendships" FOR DELETE USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id")));



CREATE POLICY "Enable delete for user_id" ON "public"."group_appointment" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."appointment" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_client" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_project" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_project_adjustment" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_project_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_project_client" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_rule" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_rule_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."finance_rule_timer_project" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."group" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."payout" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."recurring_cash_flow" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."recurring_cash_flow_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."settings" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."single_cash_flow" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."single_cash_flow_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."task" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."timer_project" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."timer_project_category" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."timer_project_folder" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."timer_session" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."appointment" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_client" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_project" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_project_adjustment" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_project_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_project_client" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_rule" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_rule_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."finance_rule_timer_project" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."friendships" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."grocery_item" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group_appointment" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group_member" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group_task" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."payout" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recurring_cash_flow" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recurring_cash_flow_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."recurring_group_task" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."settings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."single_cash_flow" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."single_cash_flow_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."task" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."timer_project" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."timer_project_category" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."timer_project_folder" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."timer_session" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all group member" ON "public"."group_appointment" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "group_appointment"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable read access for all group members" ON "public"."grocery_item" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "grocery_item"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable read access for all group members" ON "public"."group_task" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable read access for all group members" ON "public"."recurring_group_task" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_member"
  WHERE (("group_member"."group_id" = "recurring_group_task"."group_id") AND ("group_member"."user_id" = "auth"."uid"()) AND ("group_member"."status" = 'accepted'::"public"."status")))));



CREATE POLICY "Enable read access for all users" ON "public"."group" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."group_member" FOR SELECT USING (true);



CREATE POLICY "Enable read access for included user" ON "public"."friendships" FOR SELECT USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id")));



CREATE POLICY "Enable update for included users" ON "public"."friendships" FOR UPDATE USING ((("auth"."uid"() = "requester_id") OR ("auth"."uid"() = "addressee_id")));



CREATE POLICY "Enable update for users based on user_id" ON "public"."appointment" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_category" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_client" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_project" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_project_adjustment" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_project_category" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_project_client" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_rule" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_rule_category" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."finance_rule_timer_project" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."group" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."payout" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."recurring_cash_flow" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."recurring_cash_flow_category" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."settings" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."single_cash_flow" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."single_cash_flow_category" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."task" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."timer_project" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."timer_project_category" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."timer_project_folder" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "public"."timer_session" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."appointment" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_client" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_project" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_project_adjustment" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_project_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_project_client" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_rule" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_rule_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."finance_rule_timer_project" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."payout" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."recurring_cash_flow" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."recurring_cash_flow_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."settings" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."single_cash_flow" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."single_cash_flow_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."task" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."timer_project" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."timer_project_category" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."timer_project_folder" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."timer_session" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Policy with table joins" ON "public"."group_member" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."appointment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bank_account" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_client" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_project" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_project_adjustment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_project_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_project_client" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_rule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_rule_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."finance_rule_timer_project" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."friendships" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."grocery_item" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_appointment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_member" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_task" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_payou_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payout" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_cash_flow" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_cash_flow_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."recurring_group_task" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."single_cash_flow" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."single_cash_flow_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timer_project" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timer_project_category" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timer_project_folder" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."timer_session" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



























GRANT ALL ON TABLE "public"."appointment" TO "anon";
GRANT ALL ON TABLE "public"."appointment" TO "authenticated";
GRANT ALL ON TABLE "public"."appointment" TO "service_role";



GRANT ALL ON TABLE "public"."bank_account" TO "anon";
GRANT ALL ON TABLE "public"."bank_account" TO "authenticated";
GRANT ALL ON TABLE "public"."bank_account" TO "service_role";



GRANT ALL ON TABLE "public"."finance_category" TO "anon";
GRANT ALL ON TABLE "public"."finance_category" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_category" TO "service_role";



GRANT ALL ON TABLE "public"."finance_client" TO "anon";
GRANT ALL ON TABLE "public"."finance_client" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_client" TO "service_role";



GRANT ALL ON TABLE "public"."finance_project" TO "anon";
GRANT ALL ON TABLE "public"."finance_project" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_project" TO "service_role";



GRANT ALL ON TABLE "public"."finance_project_adjustment" TO "anon";
GRANT ALL ON TABLE "public"."finance_project_adjustment" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_project_adjustment" TO "service_role";



GRANT ALL ON TABLE "public"."finance_project_category" TO "anon";
GRANT ALL ON TABLE "public"."finance_project_category" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_project_category" TO "service_role";



GRANT ALL ON TABLE "public"."finance_project_client" TO "anon";
GRANT ALL ON TABLE "public"."finance_project_client" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_project_client" TO "service_role";



GRANT ALL ON TABLE "public"."finance_rule" TO "anon";
GRANT ALL ON TABLE "public"."finance_rule" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_rule" TO "service_role";



GRANT ALL ON TABLE "public"."finance_rule_category" TO "anon";
GRANT ALL ON TABLE "public"."finance_rule_category" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_rule_category" TO "service_role";



GRANT ALL ON TABLE "public"."finance_rule_timer_project" TO "anon";
GRANT ALL ON TABLE "public"."finance_rule_timer_project" TO "authenticated";
GRANT ALL ON TABLE "public"."finance_rule_timer_project" TO "service_role";



GRANT ALL ON TABLE "public"."friendships" TO "anon";
GRANT ALL ON TABLE "public"."friendships" TO "authenticated";
GRANT ALL ON TABLE "public"."friendships" TO "service_role";



GRANT ALL ON TABLE "public"."grocery_item" TO "anon";
GRANT ALL ON TABLE "public"."grocery_item" TO "authenticated";
GRANT ALL ON TABLE "public"."grocery_item" TO "service_role";



GRANT ALL ON TABLE "public"."group" TO "anon";
GRANT ALL ON TABLE "public"."group" TO "authenticated";
GRANT ALL ON TABLE "public"."group" TO "service_role";



GRANT ALL ON TABLE "public"."group_appointment" TO "anon";
GRANT ALL ON TABLE "public"."group_appointment" TO "authenticated";
GRANT ALL ON TABLE "public"."group_appointment" TO "service_role";



GRANT ALL ON TABLE "public"."group_member" TO "anon";
GRANT ALL ON TABLE "public"."group_member" TO "authenticated";
GRANT ALL ON TABLE "public"."group_member" TO "service_role";



GRANT ALL ON TABLE "public"."group_task" TO "anon";
GRANT ALL ON TABLE "public"."group_task" TO "authenticated";
GRANT ALL ON TABLE "public"."group_task" TO "service_role";



GRANT ALL ON TABLE "public"."old_payou_data" TO "anon";
GRANT ALL ON TABLE "public"."old_payou_data" TO "authenticated";
GRANT ALL ON TABLE "public"."old_payou_data" TO "service_role";



GRANT ALL ON TABLE "public"."payout" TO "anon";
GRANT ALL ON TABLE "public"."payout" TO "authenticated";
GRANT ALL ON TABLE "public"."payout" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_cash_flow" TO "anon";
GRANT ALL ON TABLE "public"."recurring_cash_flow" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_cash_flow" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_cash_flow_category" TO "anon";
GRANT ALL ON TABLE "public"."recurring_cash_flow_category" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_cash_flow_category" TO "service_role";



GRANT ALL ON TABLE "public"."recurring_group_task" TO "anon";
GRANT ALL ON TABLE "public"."recurring_group_task" TO "authenticated";
GRANT ALL ON TABLE "public"."recurring_group_task" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."single_cash_flow" TO "anon";
GRANT ALL ON TABLE "public"."single_cash_flow" TO "authenticated";
GRANT ALL ON TABLE "public"."single_cash_flow" TO "service_role";



GRANT ALL ON TABLE "public"."single_cash_flow_category" TO "anon";
GRANT ALL ON TABLE "public"."single_cash_flow_category" TO "authenticated";
GRANT ALL ON TABLE "public"."single_cash_flow_category" TO "service_role";



GRANT ALL ON TABLE "public"."task" TO "anon";
GRANT ALL ON TABLE "public"."task" TO "authenticated";
GRANT ALL ON TABLE "public"."task" TO "service_role";



GRANT ALL ON TABLE "public"."timer_project" TO "anon";
GRANT ALL ON TABLE "public"."timer_project" TO "authenticated";
GRANT ALL ON TABLE "public"."timer_project" TO "service_role";



GRANT ALL ON TABLE "public"."timer_project_category" TO "anon";
GRANT ALL ON TABLE "public"."timer_project_category" TO "authenticated";
GRANT ALL ON TABLE "public"."timer_project_category" TO "service_role";



GRANT ALL ON TABLE "public"."timer_project_folder" TO "anon";
GRANT ALL ON TABLE "public"."timer_project_folder" TO "authenticated";
GRANT ALL ON TABLE "public"."timer_project_folder" TO "service_role";



GRANT ALL ON TABLE "public"."timer_session" TO "anon";
GRANT ALL ON TABLE "public"."timer_session" TO "authenticated";
GRANT ALL ON TABLE "public"."timer_session" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";































--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



CREATE POLICY "Anyone can upload an avatar." ON "storage"."objects" FOR INSERT WITH CHECK (("bucket_id" = 'avatars'::"text"));



CREATE POLICY "Avatar images are publicly accessible." ON "storage"."objects" FOR SELECT USING (("bucket_id" = 'avatars'::"text"));



