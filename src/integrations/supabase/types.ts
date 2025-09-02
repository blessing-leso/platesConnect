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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      impact_reports: {
        Row: {
          co2_saved_kg: number
          created_at: string
          estimated_meals: number
          id: string
          kg_rescued: number
          kitchen_id: string
          surplus_id: string
        }
        Insert: {
          co2_saved_kg: number
          created_at?: string
          estimated_meals: number
          id?: string
          kg_rescued: number
          kitchen_id: string
          surplus_id: string
        }
        Update: {
          co2_saved_kg?: number
          created_at?: string
          estimated_meals?: number
          id?: string
          kg_rescued?: number
          kitchen_id?: string
          surplus_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_reports_surplus_id_fkey"
            columns: ["surplus_id"]
            isOneToOne: false
            referencedRelation: "surplus_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      kitchen_details: {
        Row: {
          address: string
          capacity_people: number
          created_at: string
          dietary_restrictions: string[] | null
          id: string
          kitchen_name: string
          operating_hours: string | null
          storage_capacity: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          capacity_people?: number
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          kitchen_name: string
          operating_hours?: string | null
          storage_capacity?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          capacity_people?: number
          created_at?: string
          dietary_restrictions?: string[] | null
          id?: string
          kitchen_name?: string
          operating_hours?: string | null
          storage_capacity?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          location: string
          phone_number: string | null
          updated_at: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          whatsapp_opted_in: boolean | null
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          location: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"]
          whatsapp_opted_in?: boolean | null
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          location?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          whatsapp_opted_in?: boolean | null
        }
        Relationships: []
      }
      surplus_listings: {
        Row: {
          created_at: string
          description: string | null
          expiry_date: string
          farmer_id: string
          id: string
          location: string
          nutritional_info: Json | null
          price: number | null
          product_name: string
          quantity: number
          status: Database["public"]["Enums"]["surplus_status"]
          unit: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expiry_date: string
          farmer_id: string
          id?: string
          location: string
          nutritional_info?: Json | null
          price?: number | null
          product_name: string
          quantity: number
          status?: Database["public"]["Enums"]["surplus_status"]
          unit?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expiry_date?: string
          farmer_id?: string
          id?: string
          location?: string
          nutritional_info?: Json | null
          price?: number | null
          product_name?: string
          quantity?: number
          status?: Database["public"]["Enums"]["surplus_status"]
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      surplus_matches: {
        Row: {
          capacity_fit_score: number | null
          claimed: boolean | null
          claimed_at: string | null
          created_at: string
          distance_km: number | null
          id: string
          kitchen_id: string
          match_score: number
          nutritional_fit_score: number | null
          pickup_scheduled_at: string | null
          surplus_id: string
        }
        Insert: {
          capacity_fit_score?: number | null
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          distance_km?: number | null
          id?: string
          kitchen_id: string
          match_score?: number
          nutritional_fit_score?: number | null
          pickup_scheduled_at?: string | null
          surplus_id: string
        }
        Update: {
          capacity_fit_score?: number | null
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string
          distance_km?: number | null
          id?: string
          kitchen_id?: string
          match_score?: number
          nutritional_fit_score?: number | null
          pickup_scheduled_at?: string | null
          surplus_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surplus_matches_surplus_id_fkey"
            columns: ["surplus_id"]
            isOneToOne: false
            referencedRelation: "surplus_listings"
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
      surplus_status: "available" | "claimed" | "collected" | "expired"
      user_type: "farmer" | "kitchen"
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
      surplus_status: ["available", "claimed", "collected", "expired"],
      user_type: ["farmer", "kitchen"],
    },
  },
} as const
