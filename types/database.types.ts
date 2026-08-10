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

export type TerminalStatus = 'available' | 'occupied' | 'offline' | 'fault';

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
      drivers: {
        Row: {
          id: string;
          user_id: string | null;
          phone_number: string | null;
          email: string | null;
          preferred_vehicle_key: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone_number?: string | null;
          email?: string | null;
          preferred_vehicle_key?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['drivers']['Insert']>;
        Relationships: NeverRelationships;
      };
      driver_favorites: {
        Row: {
          id: string;
          user_id: string;
          terminal_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          terminal_id: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['driver_favorites']['Insert']>;
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
          phone_number: string | null;
          amenities: Json;
          connectivity_tier: ConnectivityTier;
          verification_status: 'unverified' | 'verified' | 'flagged';
          current_vendor_id: string | null;
          current_owner_id: string | null;
          google_place_id: string | null;
          google_maps_url: string | null;
          google_rating: number | null;
          google_rating_count: number | null;
          google_photo_urls: string[] | null;
          google_raw: Json | null;
          source:
            | 'scraped'
            | 'manual'
            | 'vendor_submitted'
            | 'google_places'
            | 'open_charge_map'
            | null;
          scraped_at: string | null;
          last_verified_at: string | null;
          is_public: boolean;
          external_ids: Json | null;
          source_raw: Json | null;
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
          phone_number?: string | null;
          amenities?: Json;
          connectivity_tier?: ConnectivityTier;
          verification_status?: 'unverified' | 'verified' | 'flagged';
          current_vendor_id?: string | null;
          current_owner_id?: string | null;
          google_place_id?: string | null;
          google_maps_url?: string | null;
          google_rating?: number | null;
          google_rating_count?: number | null;
          google_photo_urls?: string[] | null;
          google_raw?: Json | null;
          source?:
            | 'scraped'
            | 'manual'
            | 'vendor_submitted'
            | 'google_places'
            | 'open_charge_map'
            | null;
          scraped_at?: string | null;
          last_verified_at?: string | null;
          is_public?: boolean;
          external_ids?: Json | null;
          source_raw?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['terminals']['Insert']>;
        Relationships: NeverRelationships;
      };
      charging_sessions: {
        Row: {
          id: string;
          terminal_id: string;
          driver_id: string | null;
          started_at: string;
          ended_at: string | null;
          kwh_delivered: number | null;
          amount_charged: number | null;
        };
        Insert: {
          id?: string;
          terminal_id: string;
          driver_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          kwh_delivered?: number | null;
          amount_charged?: number | null;
        };
        Update: Partial<Database['public']['Tables']['charging_sessions']['Insert']>;
        Relationships: NeverRelationships;
      };
      terminal_status_snapshots: {
        Row: {
          id: string;
          terminal_id: string;
          status: TerminalStatus;
          charge_percent: number | null;
          kwh_delivered: number | null;
          source: 'ocpp' | 'sensor' | 'demo' | 'manual';
          recorded_at: string;
        };
        Insert: {
          id?: string;
          terminal_id: string;
          status: TerminalStatus;
          charge_percent?: number | null;
          kwh_delivered?: number | null;
          source?: 'ocpp' | 'sensor' | 'demo' | 'manual';
          recorded_at?: string;
        };
        Update: Partial<Database['public']['Tables']['terminal_status_snapshots']['Insert']>;
        Relationships: NeverRelationships;
      };
      field_visibility_rules: {
        Row: {
          id: string;
          role: 'vendor' | 'owner';
          field_key: string;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          role: 'vendor' | 'owner';
          field_key: string;
          visible: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['field_visibility_rules']['Insert']>;
        Relationships: NeverRelationships;
      };
      field_visibility_overrides: {
        Row: {
          id: string;
          entity_type: 'vendor' | 'owner';
          entity_id: string;
          field_key: string;
          visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          entity_type: 'vendor' | 'owner';
          entity_id: string;
          field_key: string;
          visible: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['field_visibility_overrides']['Insert']>;
        Relationships: NeverRelationships;
      };
      session_daily_rollups: {
        Row: {
          id: string;
          day: string;
          terminal_id: string;
          vendor_id: string | null;
          owner_id: string | null;
          session_count: number;
          kwh_delivered: number;
          revenue: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day: string;
          terminal_id: string;
          vendor_id?: string | null;
          owner_id?: string | null;
          session_count?: number;
          kwh_delivered?: number;
          revenue?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['session_daily_rollups']['Insert']>;
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
      refresh_session_daily_rollups: {
        Args: {
          p_from_day?: string;
          p_to_day?: string;
        };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
