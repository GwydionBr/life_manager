export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointment: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          reminder: string | null
          start_date: string
          timer_project_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          reminder?: string | null
          start_date?: string
          timer_project_id?: string | null
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          reminder?: string | null
          start_date?: string
          timer_project_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_timer_project_id_fkey"
            columns: ["timer_project_id"]
            isOneToOne: false
            referencedRelation: "work_project"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_account: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          description: string | null
          id: string
          is_default: boolean
          saldo: number
          saldo_set_at: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency: Database["public"]["Enums"]["currency"]
          description?: string | null
          id?: string
          is_default?: boolean
          saldo?: number
          saldo_set_at?: string
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string | null
          id?: string
          is_default?: boolean
          saldo?: number
          saldo_set_at?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      contact: {
        Row: {
          address: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency"] | null
          description: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"] | null
          description?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          user_id?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"] | null
          description?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      finance_project: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          description: string | null
          due_date: string | null
          finance_client_id: string | null
          id: string
          single_cash_flow_id: string | null
          start_amount: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency: Database["public"]["Enums"]["currency"]
          description?: string | null
          due_date?: string | null
          finance_client_id?: string | null
          id?: string
          single_cash_flow_id?: string | null
          start_amount: number
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string | null
          due_date?: string | null
          finance_client_id?: string | null
          id?: string
          single_cash_flow_id?: string | null
          start_amount?: number
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_project_finance_client_id_fkey"
            columns: ["finance_client_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_single_cash_flow_id_fkey"
            columns: ["single_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "single_cashflow"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_project_adjustment: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          finance_category_id: string | null
          finance_client_id: string | null
          finance_project_id: string
          id: string
          single_cash_flow_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          finance_category_id?: string | null
          finance_client_id?: string | null
          finance_project_id: string
          id?: string
          single_cash_flow_id?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          finance_category_id?: string | null
          finance_client_id?: string | null
          finance_project_id?: string
          id?: string
          single_cash_flow_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_project_adjustment_finance_category_id_fkey"
            columns: ["finance_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_adjustment_finance_client_id_fkey"
            columns: ["finance_client_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_adjustment_finance_project_id_fkey"
            columns: ["finance_project_id"]
            isOneToOne: false
            referencedRelation: "finance_project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_adjustment_single_cash_flow_id_fkey"
            columns: ["single_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "single_cashflow"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_project_contact: {
        Row: {
          created_at: string
          finance_client_id: string
          finance_project_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finance_client_id: string
          finance_project_id: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          finance_client_id?: string
          finance_project_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_project_client_finance_client_id_fkey"
            columns: ["finance_client_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_client_finance_project_id_fkey"
            columns: ["finance_project_id"]
            isOneToOne: false
            referencedRelation: "finance_project"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_project_tag: {
        Row: {
          created_at: string
          finance_category_id: string
          finance_project_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finance_category_id: string
          finance_project_id: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          finance_category_id?: string
          finance_project_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_project_category_finance_category_id_fkey"
            columns: ["finance_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_project_category_finance_project_id_fkey"
            columns: ["finance_project_id"]
            isOneToOne: false
            referencedRelation: "finance_project"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      group: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      group_appointment: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          group_id: string
          id: string
          reminder: string | null
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          group_id?: string
          id?: string
          reminder?: string | null
          start_date?: string
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          group_id?: string
          id?: string
          reminder?: string | null
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_appointment_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      group_member: {
        Row: {
          color: string
          created_at: string
          group_id: string
          id: string
          is_Admin: boolean
          status: Database["public"]["Enums"]["status"]
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          group_id?: string
          id?: string
          is_Admin?: boolean
          status?: Database["public"]["Enums"]["status"]
          user_id?: string
        }
        Update: {
          color?: string
          created_at?: string
          group_id?: string
          id?: string
          is_Admin?: boolean
          status?: Database["public"]["Enums"]["status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_member_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      group_task: {
        Row: {
          created_at: string
          exectution_date: string
          executed: boolean
          group_id: string
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exectution_date?: string
          executed?: boolean
          group_id: string
          id?: string
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exectution_date?: string
          executed?: boolean
          group_id?: string
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_task_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      payout: {
        Row: {
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          id: string
          start_currency: Database["public"]["Enums"]["currency"] | null
          start_value: number | null
          timer_project_id: string | null
          title: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          currency: Database["public"]["Enums"]["currency"]
          id?: string
          start_currency?: Database["public"]["Enums"]["currency"] | null
          start_value?: number | null
          timer_project_id?: string | null
          title: string
          user_id?: string
          value: number
        }
        Update: {
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          id?: string
          start_currency?: Database["public"]["Enums"]["currency"] | null
          start_value?: number | null
          timer_project_id?: string | null
          title?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "payout_timer_project_id_fkey"
            columns: ["timer_project_id"]
            isOneToOne: false
            referencedRelation: "work_project"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          initialized: boolean
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id: string
          initialized?: boolean
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          initialized?: boolean
          updated_at?: string | null
          username?: string
          website?: string | null
        }
        Relationships: []
      }
      recurring_cashflow: {
        Row: {
          amount: number
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          description: string
          end_date: string | null
          finance_client_id: string | null
          id: string
          interval: Database["public"]["Enums"]["finance_interval"]
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description: string
          end_date?: string | null
          finance_client_id?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["finance_interval"]
          start_date: string
          title: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string
          end_date?: string | null
          finance_client_id?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["finance_interval"]
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_cash_flow_finance_client_id_fkey"
            columns: ["finance_client_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_cashflow_tag: {
        Row: {
          created_at: string
          finance_category_id: string
          id: string
          recurring_cash_flow_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finance_category_id: string
          id?: string
          recurring_cash_flow_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          finance_category_id?: string
          id?: string
          recurring_cash_flow_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_cash_flow_category_finance_category_id_fkey"
            columns: ["finance_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_cash_flow_category_recurring_cash_flow_id_fkey"
            columns: ["recurring_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "recurring_cashflow"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_group_task: {
        Row: {
          created_at: string
          date_time: string
          end_date: string | null
          group_id: string
          id: string
          interval_days: number
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_time?: string
          end_date?: string | null
          group_id: string
          id?: string
          interval_days: number
          start_date?: string
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date_time?: string
          end_date?: string | null
          group_id?: string
          id?: string
          interval_days?: number
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_group_task_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          automaticly_stop_other_timer: boolean
          created_at: string
          default_currency: Database["public"]["Enums"]["currency"]
          default_finance_currency: Database["public"]["Enums"]["currency"]
          default_group_color: string | null
          default_project_hourly_payment: boolean
          default_salary_amount: number
          format_24h: boolean
          id: string
          locale: Database["public"]["Enums"]["locales"]
          round_in_time_sections: boolean
          rounding_amount: Database["public"]["Enums"]["roundingAmount"]
          rounding_custom_amount: number
          rounding_direction: Database["public"]["Enums"]["roundingDirection"]
          rounding_interval: number
          show_calendar_time: boolean
          show_change_curreny_window: boolean | null
          time_section_interval: number
          updated_at: string
          user_id: string
        }
        Insert: {
          automaticly_stop_other_timer?: boolean
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency"]
          default_finance_currency?: Database["public"]["Enums"]["currency"]
          default_group_color?: string | null
          default_project_hourly_payment?: boolean
          default_salary_amount?: number
          format_24h?: boolean
          id?: string
          locale?: Database["public"]["Enums"]["locales"]
          round_in_time_sections?: boolean
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"]
          rounding_custom_amount?: number
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"]
          rounding_interval?: number
          show_calendar_time?: boolean
          show_change_curreny_window?: boolean | null
          time_section_interval?: number
          updated_at?: string
          user_id?: string
        }
        Update: {
          automaticly_stop_other_timer?: boolean
          created_at?: string
          default_currency?: Database["public"]["Enums"]["currency"]
          default_finance_currency?: Database["public"]["Enums"]["currency"]
          default_group_color?: string | null
          default_project_hourly_payment?: boolean
          default_salary_amount?: number
          format_24h?: boolean
          id?: string
          locale?: Database["public"]["Enums"]["locales"]
          round_in_time_sections?: boolean
          rounding_amount?: Database["public"]["Enums"]["roundingAmount"]
          rounding_custom_amount?: number
          rounding_direction?: Database["public"]["Enums"]["roundingDirection"]
          rounding_interval?: number
          show_calendar_time?: boolean
          show_change_curreny_window?: boolean | null
          time_section_interval?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      single_cashflow: {
        Row: {
          amount: number
          changed_date: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          date: string
          finance_client_id: string | null
          finance_project_id: string | null
          id: string
          is_active: boolean
          payout_id: string | null
          recurring_cash_flow_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          amount: number
          changed_date?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date?: string
          finance_client_id?: string | null
          finance_project_id?: string | null
          id?: string
          is_active?: boolean
          payout_id?: string | null
          recurring_cash_flow_id?: string | null
          title?: string
          user_id?: string
        }
        Update: {
          amount?: number
          changed_date?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          date?: string
          finance_client_id?: string | null
          finance_project_id?: string | null
          id?: string
          is_active?: boolean
          payout_id?: string | null
          recurring_cash_flow_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "single_cash_flow_finance_client_id_fkey"
            columns: ["finance_client_id"]
            isOneToOne: false
            referencedRelation: "contact"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "single_cash_flow_finance_project_id_fkey"
            columns: ["finance_project_id"]
            isOneToOne: false
            referencedRelation: "finance_project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "single_cash_flow_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "single_cash_flow_recurring_cash_flow_id_fkey"
            columns: ["recurring_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "recurring_cashflow"
            referencedColumns: ["id"]
          },
        ]
      }
      single_cashflow_tag: {
        Row: {
          created_at: string
          finance_category_id: string
          id: string
          single_cash_flow_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finance_category_id?: string
          id?: string
          single_cash_flow_id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          finance_category_id?: string
          id?: string
          single_cash_flow_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "single_cash_flow_category_finance_category_id_fkey"
            columns: ["finance_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "single_cash_flow_category_single_cash_flow_id_fkey"
            columns: ["single_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "single_cashflow"
            referencedColumns: ["id"]
          },
        ]
      }
      tag: {
        Row: {
          created_at: string
          description: string | null
          id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      task: {
        Row: {
          created_at: string
          exectution_date: string
          executed: boolean
          id: string
          timer_project_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exectution_date?: string
          executed?: boolean
          id?: string
          timer_project_id?: string | null
          title?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exectution_date?: string
          executed?: boolean
          id?: string
          timer_project_id?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_timer_project_id_fkey"
            columns: ["timer_project_id"]
            isOneToOne: false
            referencedRelation: "work_project"
            referencedColumns: ["id"]
          },
        ]
      }
      work_folder: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          parent_folder: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          parent_folder?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          parent_folder?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timer_project_folder_parent_folder_fkey"
            columns: ["parent_folder"]
            isOneToOne: false
            referencedRelation: "work_folder"
            referencedColumns: ["id"]
          },
        ]
      }
      work_project: {
        Row: {
          cash_flow_category_id: string | null
          color: string | null
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          description: string | null
          finance_project_id: string | null
          folder_id: string | null
          hourly_payment: boolean
          id: string
          is_favorite: boolean
          order_index: number
          round_in_time_fragments: boolean | null
          rounding_direction:
            | Database["public"]["Enums"]["roundingDirection"]
            | null
          rounding_interval: number | null
          salary: number
          time_fragment_interval: number | null
          title: string
          total_payout: number
          user_id: string
        }
        Insert: {
          cash_flow_category_id?: string | null
          color?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string | null
          finance_project_id?: string | null
          folder_id?: string | null
          hourly_payment?: boolean
          id?: string
          is_favorite?: boolean
          order_index?: number
          round_in_time_fragments?: boolean | null
          rounding_direction?:
            | Database["public"]["Enums"]["roundingDirection"]
            | null
          rounding_interval?: number | null
          salary: number
          time_fragment_interval?: number | null
          title: string
          total_payout?: number
          user_id?: string
        }
        Update: {
          cash_flow_category_id?: string | null
          color?: string | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          description?: string | null
          finance_project_id?: string | null
          folder_id?: string | null
          hourly_payment?: boolean
          id?: string
          is_favorite?: boolean
          order_index?: number
          round_in_time_fragments?: boolean | null
          rounding_direction?:
            | Database["public"]["Enums"]["roundingDirection"]
            | null
          rounding_interval?: number | null
          salary?: number
          time_fragment_interval?: number | null
          title?: string
          total_payout?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_project_finance_project_id_fkey"
            columns: ["finance_project_id"]
            isOneToOne: false
            referencedRelation: "finance_project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timerProject_cash_flow_category_id_fkey"
            columns: ["cash_flow_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timerProject_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "work_folder"
            referencedColumns: ["id"]
          },
        ]
      }
      work_project_tag: {
        Row: {
          created_at: string
          finance_category_id: string
          id: string
          timer_project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          finance_category_id: string
          id?: string
          timer_project_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          finance_category_id?: string
          id?: string
          timer_project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_project_category_finance_category_id_fkey"
            columns: ["finance_category_id"]
            isOneToOne: false
            referencedRelation: "tag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timer_project_category_timer_project_id_fkey"
            columns: ["timer_project_id"]
            isOneToOne: false
            referencedRelation: "work_project"
            referencedColumns: ["id"]
          },
        ]
      }
      work_time_entry: {
        Row: {
          active_seconds: number
          created_at: string
          currency: Database["public"]["Enums"]["currency"]
          end_time: string
          hourly_payment: boolean
          id: string
          memo: string | null
          paid: boolean
          paused_seconds: number
          payout_id: string | null
          project_id: string
          real_start_time: string | null
          salary: number
          single_cash_flow_id: string | null
          start_time: string
          time_fragments_interval: number | null
          true_end_time: string
          user_id: string
        }
        Insert: {
          active_seconds: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          end_time: string
          hourly_payment?: boolean
          id?: string
          memo?: string | null
          paid?: boolean
          paused_seconds?: number
          payout_id?: string | null
          project_id?: string
          real_start_time?: string | null
          salary: number
          single_cash_flow_id?: string | null
          start_time: string
          time_fragments_interval?: number | null
          true_end_time: string
          user_id?: string
        }
        Update: {
          active_seconds?: number
          created_at?: string
          currency?: Database["public"]["Enums"]["currency"]
          end_time?: string
          hourly_payment?: boolean
          id?: string
          memo?: string | null
          paid?: boolean
          paused_seconds?: number
          payout_id?: string | null
          project_id?: string
          real_start_time?: string | null
          salary?: number
          single_cash_flow_id?: string | null
          start_time?: string
          time_fragments_interval?: number | null
          true_end_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "timer_session_single_cash_flow_id_fkey"
            columns: ["single_cash_flow_id"]
            isOneToOne: false
            referencedRelation: "single_cashflow"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timerSession_payout_id_fkey"
            columns: ["payout_id"]
            isOneToOne: false
            referencedRelation: "payout"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timerSession_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "work_project"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      amountUnits: "kg" | "g" | "t" | "ml" | "l" | "amount"
      cash_flow_type: "expense" | "income"
      currency:
        | "USD"
        | "EUR"
        | "GBP"
        | "CAD"
        | "AUD"
        | "JPY"
        | "CHF"
        | "CNY"
        | "INR"
        | "BRL"
        | "VEF"
      finance_interval:
        | "day"
        | "week"
        | "month"
        | "1/4 year"
        | "1/2 year"
        | "year"
      locales: "en-US" | "de-DE"
      roundingAmount: "s" | "min" | "1/4h" | "1/2h" | "h" | "custom"
      roundingDirection: "up" | "down" | "nearest"
      status: "pending" | "accepted" | "declined"
      timeSectionInterval: "5min" | "10min" | "15min" | "20min" | "30min" | "1h"
      weekdays: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      amountUnits: ["kg", "g", "t", "ml", "l", "amount"],
      cash_flow_type: ["expense", "income"],
      currency: [
        "USD",
        "EUR",
        "GBP",
        "CAD",
        "AUD",
        "JPY",
        "CHF",
        "CNY",
        "INR",
        "BRL",
        "VEF",
      ],
      finance_interval: [
        "day",
        "week",
        "month",
        "1/4 year",
        "1/2 year",
        "year",
      ],
      locales: ["en-US", "de-DE"],
      roundingAmount: ["s", "min", "1/4h", "1/2h", "h", "custom"],
      roundingDirection: ["up", "down", "nearest"],
      status: ["pending", "accepted", "declined"],
      timeSectionInterval: ["5min", "10min", "15min", "20min", "30min", "1h"],
      weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
  },
} as const
