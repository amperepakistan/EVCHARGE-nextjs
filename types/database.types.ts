/**
 * Hand-maintained until `npm run types:supabase` is run against a live project.
 * Regenerate after every schema change.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = 'super_admin' | 'staff' | 'vendor' | 'owner' | 'driver';

export type ConnectivityTier =
  | 'listed'
  | 'sensor_augmented'
  | 'connected_demo'
  | 'connected_live';

export type ChargerClass = 'AC' | 'DC';

type NeverRelationships = [];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          role: UserRole;
          full_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          role: UserRole;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: NeverRelationships;
      };
      vendors: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          contact_phone: string | null;
          tier: 'standard' | 'partner';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          contact_phone?: string | null;
          tier?: 'standard' | 'partner';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>;
        Relationships: NeverRelationships;
      };
      terminal_owners: {
        Row: {
          id: string;
          name: string;
          owner_type: 'individual' | 'business';
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_type: 'individual' | 'business';
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['terminal_owners']['Insert']>;
        Relationships: NeverRelationships;
      };
      vendor_members: {
        Row: {
          id: string;
          vendor_id: string;
          user_id: string;
          member_role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          user_id: string;
          member_role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vendor_members']['Insert']>;
        Relationships: NeverRelationships;
      };
      owner_members: {
        Row: {
          id: string;
          owner_id: string;
          user_id: string;
          member_role: 'admin' | 'member';
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          user_id: string;
          member_role?: 'admin' | 'member';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['owner_members']['Insert']>;
        Relationships: NeverRelationships;
      };
      terminals: {
        Row: {
          id: string;
          name: string;
          latitude: number;
          longitude: number;
          city: string | null;
          address: string | null;
          connector_type: string | null;
          charger_class: ChargerClass | null;
          power_kw: number | null;
          price_per_kwh: number | null;
          operating_hours: string | null;
          amenities: Json;
          connectivity_tier: ConnectivityTier;
          current_vendor_id: string | null;
          current_owner_id: string | null;
          source: 'scraped' | 'manual' | 'vendor_submitted' | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latitude: number;
          longitude: number;
          city?: string | null;
          address?: string | null;
          connector_type?: string | null;
          charger_class?: ChargerClass | null;
          power_kw?: number | null;
          price_per_kwh?: number | null;
          operating_hours?: string | null;
          amenities?: Json;
          connectivity_tier?: ConnectivityTier;
          current_vendor_id?: string | null;
          current_owner_id?: string | null;
          source?: 'scraped' | 'manual' | 'vendor_submitted' | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['terminals']['Insert']>;
        Relationships: NeverRelationships;
      };
    };
    Views: Record<string, never>;
    Functions: {
      resolve_field_visibility: {
        Args: {
          p_entity_type: string;
          p_entity_id: string;
          p_field_key: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
