import { column, Schema, Table } from "@powersync/web";
// OR: import { column, Schema, Table } from '@powersync/react-native';

const profiles = new Table(
  {
    // id column (text) is automatically included
    updated_at: column.text,
    username: column.text,
    full_name: column.text,
    avatar_url: column.text,
    website: column.text,
    email: column.text,
    created_at: column.text,
    initialized: column.integer,
  },
  { indexes: {} }
);

const appointment = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    title: column.text,
    description: column.text,
    start_date: column.text,
    reminder: column.text,
    end_date: column.text,
    timer_project_id: column.text,
  },
  { indexes: {} }
);

const bank_account = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    title: column.text,
    description: column.text,
    currency: column.text,
    saldo: column.real,
    saldo_set_at: column.text,
    user_id: column.text,
    is_default: column.integer,
  },
  { indexes: {} }
);

const finance_category = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    title: column.text,
    description: column.text,
    user_id: column.text,
  },
  { indexes: {} }
);

const finance_client = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    name: column.text,
    description: column.text,
    address: column.text,
    phone: column.text,
    email: column.text,
    currency: column.text,
    user_id: column.text,
  },
  { indexes: {} }
);

const finance_project = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    start_amount: column.real,
    currency: column.text,
    due_date: column.text,
    title: column.text,
    finance_client_id: column.text,
    description: column.text,
    single_cash_flow_id: column.text,
  },
  { indexes: {} }
);

const finance_project_adjustment = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    amount: column.real,
    description: column.text,
    finance_client_id: column.text,
    finance_project_id: column.text,
    finance_category_id: column.text,
    single_cash_flow_id: column.text,
  },
  { indexes: {} }
);

const finance_project_category = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    finance_category_id: column.text,
    finance_project_id: column.text,
  },
  { indexes: {} }
);

const finance_project_client = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    finance_client_id: column.text,
    finance_project_id: column.text,
    user_id: column.text,
  },
  { indexes: {} }
);

const recurring_cash_flow = new Table(
  {
    // id column (text) is automatically included
    title: column.text,
    amount: column.real,
    description: column.text,
    start_date: column.text,
    end_date: column.text,
    user_id: column.text,
    currency: column.text,
    interval: column.text,
    created_at: column.text,
    finance_client_id: column.text,
  },
  { indexes: {} }
);

const recurring_cash_flow_category = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    recurring_cash_flow_id: column.text,
    finance_category_id: column.text,
  },
  { indexes: {} }
);

const single_cash_flow = new Table(
  {
    // id column (text) is automatically included
    amount: column.real,
    date: column.text,
    user_id: column.text,
    title: column.text,
    currency: column.text,
    created_at: column.text,
    is_active: column.integer,
    changed_date: column.text,
    recurring_cash_flow_id: column.text,
    finance_project_id: column.text,
    finance_client_id: column.text,
    payout_id: column.text,
  },
  { indexes: {} }
);

const single_cash_flow_category = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    single_cash_flow_id: column.text,
    finance_category_id: column.text,
    user_id: column.text,
  },
  { indexes: {} }
);

const payout = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    title: column.text,
    start_currency: column.text,
    start_value: column.text,
    user_id: column.text,
    timer_project_id: column.text,
    currency: column.text,
    value: column.text,
  },
  { indexes: {} }
);

const timer_project = new Table(
  {
    // id column (text) is automatically included
    title: column.text,
    description: column.text,
    salary: column.real,
    currency: column.text,
    is_favorite: column.integer,
    user_id: column.text,
    created_at: column.text,
    folder_id: column.text,
    order_index: column.integer,
    hourly_payment: column.integer,
    total_payout: column.text,
    cash_flow_category_id: column.text,
    color: column.text,
    rounding_interval: column.integer,
    rounding_direction: column.text,
    time_fragment_interval: column.integer,
    round_in_time_fragments: column.integer,
    finance_project_id: column.text,
  },
  { indexes: {} }
);

const timer_project_category = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    user_id: column.text,
    timer_project_id: column.text,
    finance_category_id: column.text,
  },
  { indexes: {} }
);

const timer_project_folder = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    title: column.text,
    description: column.text,
    parent_folder: column.text,
    user_id: column.text,
    order_index: column.integer,
  },
  { indexes: {} }
);

const timer_session = new Table(
  {
    // id column (text) is automatically included
    end_time: column.text,
    salary: column.real,
    currency: column.text,
    start_time: column.text,
    active_seconds: column.integer,
    paused_seconds: column.integer,
    project_id: column.text,
    user_id: column.text,
    created_at: column.text,
    hourly_payment: column.integer,
    paid: column.integer,
    true_end_time: column.text,
    real_start_time: column.text,
    payout_id: column.text,
    memo: column.text,
    time_fragments_interval: column.integer,
    single_cash_flow_id: column.text,
  },
  { indexes: {} }
);

const settings = new Table(
  {
    // id column (text) is automatically included
    user_id: column.text,
    default_currency: column.text,
    rounding_direction: column.text,
    rounding_amount: column.text,
    default_finance_currency: column.text,
    created_at: column.text,
    updated_at: column.text,
    rounding_custom_amount: column.integer,
    default_salary_amount: column.real,
    default_group_color: column.text,
    default_project_hourly_payment: column.integer,
    round_in_time_sections: column.integer,
    time_section_interval: column.integer,
    automaticly_stop_other_timer: column.integer,
    locale: column.text,
    show_calendar_time: column.integer,
    format_24h: column.integer,
    rounding_interval: column.integer,
    show_change_curreny_window: column.integer,
  },
  { indexes: {} }
);

const lists = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    name: column.text,
    owner_id: column.text,
  },
  { indexes: {} }
);

const todos = new Table(
  {
    // id column (text) is automatically included
    created_at: column.text,
    completed_at: column.text,
    description: column.text,
    completed: column.integer,
    created_by: column.text,
    completed_by: column.text,
    list_id: column.text,
  },
  { indexes: {} }
);

export const AppSchema = new Schema({
  profiles,
  appointment,
  bank_account,
  finance_category,
  finance_client,
  finance_project,
  finance_project_adjustment,
  finance_project_category,
  finance_project_client,
  recurring_cash_flow,
  recurring_cash_flow_category,
  single_cash_flow,
  single_cash_flow_category,
  payout,
  timer_project,
  timer_project_category,
  timer_project_folder,
  timer_session,
  settings,
  lists,
  todos,
});

export type Database = (typeof AppSchema)["types"];
