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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      business_cards: {
        Row: {
          address: string | null
          business_name: string
          climate_goals: string | null
          created_at: string
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          offer_to_businesses: string | null
          offer_to_residents: string | null
          pen_portrait: string | null
          phone: string | null
          postcode: string | null
          reward_text: string | null
          sector: string | null
          sector_icon: string | null
          stamps_required: number
          status: string
          tagline: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name: string
          climate_goals?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          offer_to_businesses?: string | null
          offer_to_residents?: string | null
          pen_portrait?: string | null
          phone?: string | null
          postcode?: string | null
          reward_text?: string | null
          sector?: string | null
          sector_icon?: string | null
          stamps_required?: number
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string
          climate_goals?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          offer_to_businesses?: string | null
          offer_to_residents?: string | null
          pen_portrait?: string | null
          phone?: string | null
          postcode?: string | null
          reward_text?: string | null
          sector?: string | null
          sector_icon?: string | null
          stamps_required?: number
          status?: string
          tagline?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          code: string
          created_at: string
          created_by: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          created_by: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      map_locations: {
        Row: {
          carbon_action: string | null
          category: string | null
          city: string | null
          country: string | null
          created_at: string
          description: string | null
          id: number
          latitude: number | null
          longitude: number | null
          postcode: string | null
          street_address: string | null
          title: string
          updated_at: string
        }
        Insert: {
          carbon_action?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id: number
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          street_address?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          carbon_action?: string | null
          category?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          postcode?: string | null
          street_address?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pledges: {
        Row: {
          category: string | null
          co2_saved: number | null
          created_at: string
          description: string | null
          id: number
          key: string | null
          money_saved: number | null
          reward: string | null
          sub_category: string | null
          tag: string | null
          title: string
          updated_at: string
          user_group: string | null
          water_saved: number | null
          wool_points: number | null
        }
        Insert: {
          category?: string | null
          co2_saved?: number | null
          created_at?: string
          description?: string | null
          id: number
          key?: string | null
          money_saved?: number | null
          reward?: string | null
          sub_category?: string | null
          tag?: string | null
          title: string
          updated_at?: string
          user_group?: string | null
          water_saved?: number | null
          wool_points?: number | null
        }
        Update: {
          category?: string | null
          co2_saved?: number | null
          created_at?: string
          description?: string | null
          id?: number
          key?: string | null
          money_saved?: number | null
          reward?: string | null
          sub_category?: string | null
          tag?: string | null
          title?: string
          updated_at?: string
          user_group?: string | null
          water_saved?: number | null
          wool_points?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          address: string | null
          age: string | null
          avatar_level: number
          calc_bonus_awarded: boolean
          created_at: string
          current_footprint: number
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postcode: string | null
          total_points: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_type?: string
          address?: string | null
          age?: string | null
          avatar_level?: number
          calc_bonus_awarded?: boolean
          created_at?: string
          current_footprint?: number
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postcode?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_type?: string
          address?: string | null
          age?: string | null
          avatar_level?: number
          calc_bonus_awarded?: boolean
          created_at?: string
          current_footprint?: number
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postcode?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      story_kudos: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_kudos_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "user_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          english_version: string | null
          id: number
          language_code: string
          source_table: string | null
          translation: string
          type_id: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          english_version?: string | null
          id: number
          language_code: string
          source_table?: string | null
          translation: string
          type_id?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          english_version?: string | null
          id?: number
          language_code?: string
          source_table?: string | null
          translation?: string
          type_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tree_requests: {
        Row: {
          created_at: string
          id: string
          planting_date: string | null
          points_used: number
          status: string
          tree_species: string
          updated_at: string
          user_id: string
          what3words_location: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          planting_date?: string | null
          points_used?: number
          status?: string
          tree_species?: string
          updated_at?: string
          user_id: string
          what3words_location?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          planting_date?: string | null
          points_used?: number
          status?: string
          tree_species?: string
          updated_at?: string
          user_id?: string
          what3words_location?: string | null
        }
        Relationships: []
      }
      user_bin_day: {
        Row: {
          created_at: string
          data: Json
          dismissed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          dismissed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          dismissed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_business_stamps: {
        Row: {
          business_card_id: string
          created_at: string
          id: string
          redeemed_at: string | null
          stamps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          business_card_id: string
          created_at?: string
          id?: string
          redeemed_at?: string | null
          stamps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          business_card_id?: string
          created_at?: string
          id?: string
          redeemed_at?: string | null
          stamps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_business_stamps_business_card_id_fkey"
            columns: ["business_card_id"]
            isOneToOne: false
            referencedRelation: "business_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_business_stamps_business_card_id_fkey"
            columns: ["business_card_id"]
            isOneToOne: false
            referencedRelation: "business_cards_public"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calc_categories: {
        Row: {
          completed: Json
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: Json
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: Json
          created_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pledges: {
        Row: {
          action: string
          category: string
          completed_at: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          action: string
          category: string
          completed_at?: string
          id?: string
          points_earned: number
          user_id: string
        }
        Update: {
          action?: string
          category?: string
          completed_at?: string
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      user_points_ledger: {
        Row: {
          created_at: string
          id: string
          points: number
          points_type: string
          reference_id: string | null
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points: number
          points_type: string
          reference_id?: string | null
          source: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          points_type?: string
          reference_id?: string | null
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          learning_preferences: Json | null
          sheep_head: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          learning_preferences?: Json | null
          sheep_head?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          learning_preferences?: Json | null
          sheep_head?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_renewables: {
        Row: {
          id: string
          points_cost: number
          position_x: number | null
          position_y: number | null
          purchased_at: string
          technology_type: string
          user_id: string
        }
        Insert: {
          id?: string
          points_cost: number
          position_x?: number | null
          position_y?: number | null
          purchased_at?: string
          technology_type: string
          user_id: string
        }
        Update: {
          id?: string
          points_cost?: number
          position_x?: number | null
          position_y?: number | null
          purchased_at?: string
          technology_type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_responses: {
        Row: {
          answer_value: string
          category: string
          created_at: string
          id: string
          impact_value: number
          question_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answer_value: string
          category: string
          created_at?: string
          id?: string
          impact_value: number
          question_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answer_value?: string
          category?: string
          created_at?: string
          id?: string
          impact_value?: number
          question_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_sprints: {
        Row: {
          created_at: string
          data: Json
          id: string
          sprint_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          sprint_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          sprint_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_state: {
        Row: {
          created_at: string
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stories: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          points_earned: number
          run_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          points_earned?: number
          run_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          points_earned?: number
          run_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_walk_stamps: {
        Row: {
          created_at: string
          data: Json
          stamps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          stamps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          stamps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wallet: {
        Row: {
          business_id: string
          created_at: string
          data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_id: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_id?: string
          created_at?: string
          data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      business_cards_public: {
        Row: {
          business_name: string | null
          climate_goals: string | null
          created_at: string | null
          id: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          offer_to_businesses: string | null
          offer_to_residents: string | null
          pen_portrait: string | null
          reward_text: string | null
          sector: string | null
          sector_icon: string | null
          stamps_required: number | null
          status: string | null
          tagline: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          business_name?: string | null
          climate_goals?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          offer_to_businesses?: string | null
          offer_to_residents?: string | null
          pen_portrait?: string | null
          reward_text?: string | null
          sector?: string | null
          sector_icon?: string | null
          stamps_required?: number | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          business_name?: string | null
          climate_goals?: string | null
          created_at?: string | null
          id?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          offer_to_businesses?: string | null
          offer_to_residents?: string | null
          pen_portrait?: string | null
          reward_text?: string | null
          sector?: string | null
          sector_icon?: string | null
          stamps_required?: number | null
          status?: string | null
          tagline?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_leaderboard: {
        Args: { _limit?: number }
        Returns: {
          avatar_level: number
          display_name: string
          total_points: number
          user_id: string
          username: string
        }[]
      }
      get_public_profile: {
        Args: { _user_id: string }
        Returns: {
          avatar_level: number
          display_name: string
          total_points: number
          user_id: string
          username: string
        }[]
      }
      is_group_member: {
        Args: { _group: string; _user: string }
        Returns: boolean
      }
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
    Enums: {},
  },
} as const
