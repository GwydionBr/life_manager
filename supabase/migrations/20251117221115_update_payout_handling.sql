revoke delete on table "public"."old_payou_data" from "anon";

revoke insert on table "public"."old_payou_data" from "anon";

revoke references on table "public"."old_payou_data" from "anon";

revoke select on table "public"."old_payou_data" from "anon";

revoke trigger on table "public"."old_payou_data" from "anon";

revoke truncate on table "public"."old_payou_data" from "anon";

revoke update on table "public"."old_payou_data" from "anon";

revoke delete on table "public"."old_payou_data" from "authenticated";

revoke insert on table "public"."old_payou_data" from "authenticated";

revoke references on table "public"."old_payou_data" from "authenticated";

revoke select on table "public"."old_payou_data" from "authenticated";

revoke trigger on table "public"."old_payou_data" from "authenticated";

revoke truncate on table "public"."old_payou_data" from "authenticated";

revoke update on table "public"."old_payou_data" from "authenticated";

revoke delete on table "public"."old_payou_data" from "service_role";

revoke insert on table "public"."old_payou_data" from "service_role";

revoke references on table "public"."old_payou_data" from "service_role";

revoke select on table "public"."old_payou_data" from "service_role";

revoke trigger on table "public"."old_payou_data" from "service_role";

revoke truncate on table "public"."old_payou_data" from "service_role";

revoke update on table "public"."old_payou_data" from "service_role";

alter table "public"."old_payou_data" drop constraint "old_payou_data_cashflow_id_fkey";

alter table "public"."old_payou_data" drop constraint "old_payou_data_finance_project_id_fkey";

alter table "public"."old_payou_data" drop constraint "old_payou_data_timer_project_id_fkey";

alter table "public"."old_payou_data" drop constraint "old_payou_data_timer_session_project_id_fkey";

alter table "public"."old_payou_data" drop constraint "old_payou_data_user_id_fkey";

alter table "public"."payout" drop constraint "payout_cashflow_id_fkey";

alter table "public"."payout" drop constraint "payout_finance_project_id_fkey";

alter table "public"."payout" drop constraint "payout_timer_session_project_id_fkey";

alter table "public"."recurring_cash_flow" drop constraint "recurring_cash_flow_category_id_fkey";

alter table "public"."single_cash_flow" drop constraint "single_cash_flow_category_id_fkey";

alter table "public"."old_payou_data" drop constraint "old_payou_data_pkey";

drop index if exists "public"."old_payou_data_pkey";

drop table "public"."old_payou_data";


  create table "public"."old_payout_data" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "title" text not null,
    "start_currency" public.currency not null,
    "end_currency" public.currency,
    "start_value" numeric not null,
    "end_value" numeric,
    "cashflow_id" uuid not null,
    "user_id" uuid not null default auth.uid(),
    "timer_project_id" uuid,
    "finance_project_id" uuid,
    "timer_session_project_id" uuid
      );


alter table "public"."old_payout_data" enable row level security;

alter table "public"."payout" alter column start_currency type "public"."currency" using start_currency::text::"public"."currency";

alter table "public"."payout" drop column "cashflow_id";

alter table "public"."payout" drop column "end_currency";

alter table "public"."payout" drop column "end_value";

alter table "public"."payout" drop column "finance_project_id";

alter table "public"."payout" drop column "timer_session_project_id";

alter table "public"."payout" add column "currency" public.currency not null;

alter table "public"."payout" add column "value" numeric not null;

alter table "public"."payout" alter column "start_currency" drop not null;

alter table "public"."payout" alter column "start_value" drop not null;

alter table "public"."recurring_cash_flow" drop column "category_id";

alter table "public"."recurring_cash_flow" drop column "type";

alter table "public"."single_cash_flow" drop column "category_id";

alter table "public"."single_cash_flow" drop column "type";

alter table "public"."single_cash_flow" add column "payout_id" uuid;

CREATE UNIQUE INDEX old_payou_data_pkey ON public.old_payout_data USING btree (id);

alter table "public"."old_payout_data" add constraint "old_payou_data_pkey" PRIMARY KEY using index "old_payou_data_pkey";

alter table "public"."old_payout_data" add constraint "old_payou_data_cashflow_id_fkey" FOREIGN KEY (cashflow_id) REFERENCES public.single_cash_flow(id) ON DELETE CASCADE not valid;

alter table "public"."old_payout_data" validate constraint "old_payou_data_cashflow_id_fkey";

alter table "public"."old_payout_data" add constraint "old_payou_data_finance_project_id_fkey" FOREIGN KEY (finance_project_id) REFERENCES public.finance_project(id) ON DELETE SET NULL not valid;

alter table "public"."old_payout_data" validate constraint "old_payou_data_finance_project_id_fkey";

alter table "public"."old_payout_data" add constraint "old_payou_data_timer_project_id_fkey" FOREIGN KEY (timer_project_id) REFERENCES public.timer_project(id) ON DELETE SET NULL not valid;

alter table "public"."old_payout_data" validate constraint "old_payou_data_timer_project_id_fkey";

alter table "public"."old_payout_data" add constraint "old_payou_data_timer_session_project_id_fkey" FOREIGN KEY (timer_session_project_id) REFERENCES public.timer_project(id) ON DELETE SET NULL not valid;

alter table "public"."old_payout_data" validate constraint "old_payou_data_timer_session_project_id_fkey";

alter table "public"."old_payout_data" add constraint "old_payou_data_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."old_payout_data" validate constraint "old_payou_data_user_id_fkey";

alter table "public"."single_cash_flow" add constraint "single_cash_flow_payout_id_fkey" FOREIGN KEY (payout_id) REFERENCES public.payout(id) ON DELETE SET NULL not valid;

alter table "public"."single_cash_flow" validate constraint "single_cash_flow_payout_id_fkey";

grant delete on table "public"."old_payout_data" to "anon";

grant insert on table "public"."old_payout_data" to "anon";

grant references on table "public"."old_payout_data" to "anon";

grant select on table "public"."old_payout_data" to "anon";

grant trigger on table "public"."old_payout_data" to "anon";

grant truncate on table "public"."old_payout_data" to "anon";

grant update on table "public"."old_payout_data" to "anon";

grant delete on table "public"."old_payout_data" to "authenticated";

grant insert on table "public"."old_payout_data" to "authenticated";

grant references on table "public"."old_payout_data" to "authenticated";

grant select on table "public"."old_payout_data" to "authenticated";

grant trigger on table "public"."old_payout_data" to "authenticated";

grant truncate on table "public"."old_payout_data" to "authenticated";

grant update on table "public"."old_payout_data" to "authenticated";

grant delete on table "public"."old_payout_data" to "service_role";

grant insert on table "public"."old_payout_data" to "service_role";

grant references on table "public"."old_payout_data" to "service_role";

grant select on table "public"."old_payout_data" to "service_role";

grant trigger on table "public"."old_payout_data" to "service_role";

grant truncate on table "public"."old_payout_data" to "service_role";

grant update on table "public"."old_payout_data" to "service_role";


create schema if not exists "habbit_tracker";