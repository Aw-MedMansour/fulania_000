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
      books: {
        Row: {
          author: string
          category: string | null
          cover_path: string | null
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          dialect: string | null
          download_count: number
          file_size_bytes: number | null
          id: string
          isbn: string | null
          language: string | null
          pages: number | null
          pdf_path: string
          pdf_url: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          author: string
          category?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dialect?: string | null
          download_count?: number
          file_size_bytes?: number | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          pdf_path: string
          pdf_url: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          author?: string
          category?: string | null
          cover_path?: string | null
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          dialect?: string | null
          download_count?: number
          file_size_bytes?: number | null
          id?: string
          isbn?: string | null
          language?: string | null
          pages?: number | null
          pdf_path?: string
          pdf_url?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          sources: Json | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          sources?: Json | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          sources?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          exercises: Json
          id: string
          mission_date: string
          score: number | null
          slot: number
          theme: string | null
          title: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          exercises: Json
          id?: string
          mission_date: string
          score?: number | null
          slot: number
          theme?: string | null
          title: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          exercises?: Json
          id?: string
          mission_date?: string
          score?: number | null
          slot?: number
          theme?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      dictionary_entries: {
        Row: {
          arabic: string | null
          category: string | null
          created_at: string
          english: string | null
          example_french: string | null
          example_pulaar: string | null
          french: string
          id: string
          pronunciation: string | null
          pulaar: string
        }
        Insert: {
          arabic?: string | null
          category?: string | null
          created_at?: string
          english?: string | null
          example_french?: string | null
          example_pulaar?: string | null
          french: string
          id?: string
          pronunciation?: string | null
          pulaar: string
        }
        Update: {
          arabic?: string | null
          category?: string | null
          created_at?: string
          english?: string | null
          example_french?: string | null
          example_pulaar?: string | null
          french?: string
          id?: string
          pronunciation?: string | null
          pulaar?: string
        }
        Relationships: []
      }
      dictionary_v2: {
        Row: {
          arabic: string | null
          created_at: string
          domain: string
          english: string | null
          example_english: string | null
          example_french: string | null
          example_pulaar: string | null
          french: string
          headword: string
          headword_normalized: string | null
          id: string
          notes: string | null
          noun_class: string | null
          origin: Database["public"]["Enums"]["entry_origin"]
          pos: Database["public"]["Enums"]["pulaar_pos"]
          pronunciation_ipa: string | null
          related: string[] | null
          sources: string[] | null
          status: Database["public"]["Enums"]["entry_status"]
          synonyms: string[] | null
          updated_at: string
          variant_adamaawa: string | null
          variant_fouta_jallon: string | null
          variant_fouta_tooro: string | null
          variant_maasina: string | null
          verb_class: string | null
        }
        Insert: {
          arabic?: string | null
          created_at?: string
          domain: string
          english?: string | null
          example_english?: string | null
          example_french?: string | null
          example_pulaar?: string | null
          french: string
          headword: string
          headword_normalized?: string | null
          id?: string
          notes?: string | null
          noun_class?: string | null
          origin?: Database["public"]["Enums"]["entry_origin"]
          pos: Database["public"]["Enums"]["pulaar_pos"]
          pronunciation_ipa?: string | null
          related?: string[] | null
          sources?: string[] | null
          status?: Database["public"]["Enums"]["entry_status"]
          synonyms?: string[] | null
          updated_at?: string
          variant_adamaawa?: string | null
          variant_fouta_jallon?: string | null
          variant_fouta_tooro?: string | null
          variant_maasina?: string | null
          verb_class?: string | null
        }
        Update: {
          arabic?: string | null
          created_at?: string
          domain?: string
          english?: string | null
          example_english?: string | null
          example_french?: string | null
          example_pulaar?: string | null
          french?: string
          headword?: string
          headword_normalized?: string | null
          id?: string
          notes?: string | null
          noun_class?: string | null
          origin?: Database["public"]["Enums"]["entry_origin"]
          pos?: Database["public"]["Enums"]["pulaar_pos"]
          pronunciation_ipa?: string | null
          related?: string[] | null
          sources?: string[] | null
          status?: Database["public"]["Enums"]["entry_status"]
          synonyms?: string[] | null
          updated_at?: string
          variant_adamaawa?: string | null
          variant_fouta_jallon?: string | null
          variant_fouta_tooro?: string | null
          variant_maasina?: string | null
          verb_class?: string | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cents: number
          confirmed_at: string | null
          created_at: string
          currency: string
          display_name: string | null
          id: string
          message: string | null
          provider: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id?: string
          message?: string | null
          provider?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          display_name?: string | null
          id?: string
          message?: string | null
          provider?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      fundraiser_goal: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          goal_cents: number
          id: string
          is_active: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          goal_cents: number
          id?: string
          is_active?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          goal_cents?: number
          id?: string
          is_active?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_code: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_code: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_code?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_card_progress: {
        Row: {
          created_at: string
          ease: number
          entry_id: string
          id: string
          interval_days: number
          lapses: number
          last_reviewed_at: string | null
          next_review: string
          reps: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ease?: number
          entry_id: string
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          next_review?: string
          reps?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ease?: number
          entry_id?: string
          id?: string
          interval_days?: number
          lapses?: number
          last_reviewed_at?: string | null
          next_review?: string
          reps?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_card_progress_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_history: {
        Row: {
          entry_id: string
          id: string
          user_id: string
          viewed_at: string
        }
        Insert: {
          entry_id: string
          id?: string
          user_id: string
          viewed_at?: string
        }
        Update: {
          entry_id?: string
          id?: string
          user_id?: string
          viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_history_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "dictionary_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_learning_progress: {
        Row: {
          created_at: string
          hearts: number
          last_active_date: string | null
          last_heart_lost_at: string | null
          level: number
          streak_days: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          hearts?: number
          last_active_date?: string | null
          last_heart_lost_at?: string | null
          level?: number
          streak_days?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          hearts?: number
          last_active_date?: string | null
          last_heart_lost_at?: string | null
          level?: number
          streak_days?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          last_active: string | null
          streak_days: number
          total_favorites: number
          total_views: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          last_active?: string | null
          streak_days?: number
          total_favorites?: number
          total_views?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          last_active?: string | null
          streak_days?: number
          total_favorites?: number
          total_views?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_credits: {
        Row: {
          balance: number
          created_at: string
          total_purchased: number
          total_used: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          total_purchased?: number
          total_used?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_generations: {
        Row: {
          aspect_ratio: string
          created_at: string
          credits_spent: number
          description: string
          duration_seconds: number
          error_message: string | null
          id: string
          job_id: string | null
          model: string
          prompt: string
          resolution: string
          status: string
          storage_path: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aspect_ratio?: string
          created_at?: string
          credits_spent?: number
          description: string
          duration_seconds?: number
          error_message?: string | null
          id?: string
          job_id?: string | null
          model: string
          prompt: string
          resolution?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          credits_spent?: number
          description?: string
          duration_seconds?: number
          error_message?: string | null
          id?: string
          job_id?: string | null
          model?: string
          prompt?: string
          resolution?: string
          status?: string
          storage_path?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      donations_public: {
        Row: {
          amount_cents: number | null
          confirmed_at: string | null
          created_at: string | null
          currency: string | null
          display_name: string | null
          id: string | null
          message: string | null
          status: string | null
        }
        Relationships: []
      }
      donations_public_stats: {
        Row: {
          donor_count: number | null
          total_confirmed_cents: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_public_donations: {
        Args: never
        Returns: {
          amount_cents: number
          confirmed_at: string
          created_at: string
          currency: string
          display_name: string
          id: string
          message: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_book_downloads: {
        Args: { _book_id: string }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      app_role: "admin" | "user"
      entry_origin:
        | "traditionnel"
        | "emprunt_arabe"
        | "emprunt_francais"
        | "emprunt_anglais"
        | "neologisme"
        | "propose"
      entry_status: "valide" | "propose" | "incertain"
      pulaar_pos:
        | "nom"
        | "verbe"
        | "adjectif"
        | "adverbe"
        | "pronom"
        | "interjection"
        | "expression"
        | "proverbe"
        | "conjonction"
        | "preposition"
        | "determinant"
        | "numeral"
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
      app_role: ["admin", "user"],
      entry_origin: [
        "traditionnel",
        "emprunt_arabe",
        "emprunt_francais",
        "emprunt_anglais",
        "neologisme",
        "propose",
      ],
      entry_status: ["valide", "propose", "incertain"],
      pulaar_pos: [
        "nom",
        "verbe",
        "adjectif",
        "adverbe",
        "pronom",
        "interjection",
        "expression",
        "proverbe",
        "conjonction",
        "preposition",
        "determinant",
        "numeral",
      ],
    },
  },
} as const
