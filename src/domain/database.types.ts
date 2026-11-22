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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          data: Json
          id: boolean
        }
        Insert: {
          data: Json
          id?: boolean
        }
        Update: {
          data?: Json
          id?: boolean
        }
        Relationships: []
      }
      private_events: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          data: Json
          id: string
        }
        Insert: {
          created_at?: string
          data: Json
          id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
      public_events: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      quote_requests: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_requests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          business_id: string | null
          created_at: string
          data: Json
          event_id: string | null
          id: string
          owner_id: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          data: Json
          event_id?: string | null
          id?: string
          owner_id: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          data?: Json
          event_id?: string | null
          id?: string
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "private_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      eventin_claim_admin: { Args: { token: string }; Returns: boolean }
      eventin_command: { Args: { action: string; input?: Json }; Returns: Json }
      eventin_set_cover: {
        Args: { kind: string; path: string; resource: string }
        Returns: undefined
      }
      eventin_snapshot: { Args: never; Returns: Json }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

