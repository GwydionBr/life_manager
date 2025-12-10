-- supabase/seed.sql
--
-- Ensure extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- create test users
INSERT INTO
    auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) (
        select
            '00000000-0000-0000-0000-000000000000',
            extensions.uuid_generate_v4 (),
            'authenticated',
            'authenticated',
            'test' || (ROW_NUMBER() OVER ()) || '@test.com',
            extensions.crypt ('TestPassword', extensions.gen_salt ('bf')),
            current_timestamp,
            current_timestamp,
            current_timestamp,
            '{"provider":"email","providers":["email"]}',
            '{}',
            current_timestamp,
            current_timestamp,
            '',
            '',
            '',
            ''
        FROM
            generate_series(1, 5)
    );

DO $$
DECLARE
    v_user_id uuid;
    v_project_id_1 uuid;
    v_project_id_2 uuid;
    v_folder_id_1 uuid;
BEGIN
    -- get user_id
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email LIKE 'test%@test.com'
    ORDER BY email
    LIMIT 1;

    -- initialize user 1
    UPDATE public.profiles
    SET initialized = true,
        username = 'main_test',
        full_name = 'Test User 1',
        email = 'test1@test.com',
        avatar_url = 'https://ui-avatars.com/api/?name=Test+User'
    WHERE id = v_user_id;

    -- create finance categories
    INSERT INTO public.finance_category (title, description, user_id) VALUES
        ('Food', 'Food category', v_user_id),
        ('Transportation', 'Transportation category', v_user_id),
        ('Housing', 'Housing category', v_user_id),
        ('Utilities', 'Utilities category', v_user_id),
        ('Entertainment', 'Entertainment category', v_user_id),
        ('Other', 'Other category', v_user_id);

    -- create finance clients
    INSERT INTO public.finance_client (name, user_id) VALUES
        ('Client 1', v_user_id),
        ('Client 2', v_user_id),
        ('Client 3', v_user_id);

    -- create timer project folders
    INSERT INTO public.timer_project_folder (title, user_id, order_index) VALUES
        ('Projects 11-20', v_user_id, 9);

    -- select folder id
    SELECT id INTO v_folder_id_1 FROM public.timer_project_folder WHERE title = 'Projects 11-20';

    -- create timer projects
    INSERT INTO public.timer_project (title, description, salary, currency, user_id, color, order_index, folder_id) VALUES
        ('Project 1', 'Project 1 description', 100, 'USD', v_user_id, '#fab005', 0, null),
        ('Project 2', 'Project 2 description', 200, 'USD', v_user_id, null, 1, null),
        ('Project 3', 'Project 3 description', 100, 'USD', v_user_id, null, 2, null),
        ('Project 4', 'Project 4 description', 200, 'USD', v_user_id, null, 3, null),
        ('Project 5', 'Project 5 description', 100, 'USD', v_user_id, null, 4, null),
        ('Project 6', 'Project 6 description', 200, 'USD', v_user_id, null, 5, null),
        ('Project 7', 'Project 7 description', 100, 'USD', v_user_id, null, 6, null),
        ('Project 8', 'Project 8 description', 200, 'USD', v_user_id, null, 7, null),
        ('Project 9', 'Project 9 description', 100, 'USD', v_user_id, null, 8, null),
        ('Project 10', 'Project 10 description', 200, 'USD', v_user_id, null, 9, null),
        ('Project 11', 'Project 11 description', 100, 'USD', v_user_id, null, 0, v_folder_id_1),
        ('Project 12', 'Project 12 description', 200, 'USD', v_user_id, null, 1, v_folder_id_1),
        ('Project 13', 'Project 13 description', 100, 'USD', v_user_id, null, 2, v_folder_id_1),
        ('Project 14', 'Project 14 description', 200, 'USD', v_user_id, null, 3, v_folder_id_1),
        ('Project 15', 'Project 15 description', 100, 'USD', v_user_id, null, 4, v_folder_id_1), 
        ('Project 16', 'Project 16 description', 200, 'USD', v_user_id, null, 5, v_folder_id_1),
        ('Project 17', 'Project 17 description', 100, 'USD', v_user_id, null, 6, v_folder_id_1),
        ('Project 18', 'Project 18 description', 200, 'USD', v_user_id, null, 7, v_folder_id_1),
        ('Project 19', 'Project 19 description', 100, 'USD', v_user_id, null, 8, v_folder_id_1),
        ('Project 20', 'Project 20 description', 200, 'USD', v_user_id, null, 9, v_folder_id_1);

    -- select project 1 id
    SELECT id INTO v_project_id_1 FROM public.timer_project WHERE title = 'Project 1';

    -- create timer sessions for project 1
    INSERT INTO public.timer_session (project_id, start_time, end_time, true_end_time, active_seconds, salary, currency, user_id) VALUES
        (v_project_id_1, now() - interval '1 hour', now(), now(), 3600, 100, 'USD', v_user_id),
        (v_project_id_1, now() - interval '2 hours', now() - interval '1 hour', now() - interval '1 hour', 3600, 100, 'USD', v_user_id),
        (v_project_id_1, now() - interval '3 hours', now() - interval '2 hours', now() - interval '2 hours', 3600, 100, 'USD', v_user_id),
        (v_project_id_1, now() - interval '4 hours', now() - interval '3 hours', now() - interval '3 hours', 3600, 100, 'USD', v_user_id),
        (v_project_id_1, now() - interval '5 hours', now() - interval '4 hours', now() - interval '4 hours', 3600, 100, 'USD', v_user_id),
        (v_project_id_1, now() - interval '6 hours', now() - interval '5 hours', now() - interval '5 hours', 3600, 100, 'USD', v_user_id);


    -- select project 2 id
    SELECT id INTO v_project_id_2 FROM public.timer_project WHERE title = 'Project 2';

    -- create timer sessions for project 2
    INSERT INTO public.timer_session (project_id, start_time, end_time, true_end_time, active_seconds, salary, currency, user_id) VALUES
        (v_project_id_2, now() - interval '25 hour', now() - interval '24 hour', now() - interval '24 hour', 3600, 200, 'USD', v_user_id),
        (v_project_id_2, now() - interval '26 hours', now() - interval '25 hour', now() - interval '25 hour', 3600, 200, 'USD', v_user_id);

    -- create single cash flows
    INSERT INTO public.single_cash_flow (title, user_id, amount) VALUES
        ('Cash Flow 1', v_user_id, 100),
        ('Cash Flow 2', v_user_id, -200),
        ('Cash Flow 3', v_user_id, 100);

    -- create recurring cash flows
    INSERT INTO public.recurring_cash_flow (title, user_id, amount, description, start_date) VALUES
        ('Recurring Cash Flow 1', v_user_id, 100, 'Recurring Cash Flow 1 description', now()),
        ('Recurring Cash Flow 2', v_user_id, -200, 'Recurring Cash Flow 2 description', now()),
        ('Recurring Cash Flow 3', v_user_id, 100, 'Recurring Cash Flow 3 description', now());

END $$;