export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      business_plan_sections: {
        Row: {
          completed_at: string | null
          id: string
          is_complete: boolean | null
          modified_by_email: string | null
          plan_id: string
          section_content: string | null
          section_name: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean | null
          modified_by_email?: string | null
          plan_id: string
          section_content?: string | null
          section_name: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          id?: string
          is_complete?: boolean | null
          modified_by_email?: string | null
          plan_id?: string
          section_content?: string | null
          section_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_sections_plan_id_fkey"
            columns: ["plan_id"]
            referencedRelation: "business_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      business_plans: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          plan_name: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          plan_name: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          plan_name?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plans_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          email: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          email?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          email?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      handle_new_user: {
        Args: Record<PropertyKey, never>
        Returns: unknown
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

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type BusinessPlan = Database["public"]["Tables"]["business_plans"]["Row"]
export type BusinessPlanSection = Database["public"]["Tables"]["business_plan_sections"]["Row"]
