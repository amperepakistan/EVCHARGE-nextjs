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

export type AppPlatform = 'ios' | 'android';

type NeverRelationships = [];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          // Dashboard accounts sign in with email + password; driver accounts
          // created via phone OTP have both columns null.
          email: string | null;
          password_hash: string | null;
          phone_number: string | null;
          role: UserRole;
          full_name: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email?: string | null;
          password_hash?: string | null;
          phone_number?: string | null;
          role: UserRole;
          full_name?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: NeverRelationships;
      };
      phone_otp_challenges: {
        Row: {
          phone_number: string;
          code_hash: string;
          expires_at: string;
          attempts: number;
          last_sent_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          phone_number: string;
          code_hash: string;
          expires_at: string;
          attempts?: number;
          last_sent_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['phone_otp_challenges']['Insert']>;
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
          profile_image_url: string | null;
          profile_image_updated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          phone_number?: string | null;
          email?: string | null;
          preferred_vehicle_key?: string | null;
          profile_image_url?: string | null;
          profile_image_updated_at?: string | null;
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
      terminal_cameras: {
        Row: {
          id: string;
          terminal_id: string;
          label: string;
          stream_type: 'snapshot' | 'mjpeg' | 'rtsp';
          stream_url: string | null;
          snapshot_url: string | null;
          online: boolean;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          terminal_id: string;
          label: string;
          stream_type?: 'snapshot' | 'mjpeg' | 'rtsp';
          stream_url?: string | null;
          snapshot_url?: string | null;
          online?: boolean;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['terminal_cameras']['Insert']>;
        Relationships: NeverRelationships;
      };
      user_push_tokens: {
        Row: {
          id: string;
          user_id: string;
          fcm_token: string;
          platform: 'android' | 'ios' | 'web';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fcm_token: string;
          platform?: 'android' | 'ios' | 'web';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_push_tokens']['Insert']>;
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
            | 'driver_submitted'
            | null;
          scraped_at: string | null;
          last_verified_at: string | null;
          is_public: boolean;
          submitted_by_user_id: string | null;
          submission_notes: string | null;
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
            | 'driver_submitted'
            | null;
          scraped_at?: string | null;
          last_verified_at?: string | null;
          is_public?: boolean;
          submitted_by_user_id?: string | null;
          submission_notes?: string | null;
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
      app_config: {
        Row: {
          platform: AppPlatform;
          min_version: string;
          min_build_number: number;
          latest_version: string;
          latest_build_number: number;
          force_update: boolean;
          store_url: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          platform: AppPlatform;
          min_version?: string;
          min_build_number?: number;
          latest_version?: string;
          latest_build_number?: number;
          force_update?: boolean;
          store_url?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['app_config']['Insert']>;
        Relationships: NeverRelationships;
      };
      ev_vehicles: {
        Row: {
          id: string;
          brand: string;
          model: string;
          vehicle_type: string | null;
          battery_capacity_kwh: number | null;
          range_km: number | null;
          ac_charging_kw: number | null;
          dc_charging_kw: number | null;
          connector: string;
          price_pkr: number | null;
          source_url: string | null;
          source: string | null;
          scraped_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          brand: string;
          model: string;
          vehicle_type?: string | null;
          battery_capacity_kwh?: number | null;
          range_km?: number | null;
          ac_charging_kw?: number | null;
          dc_charging_kw?: number | null;
          connector?: string;
          price_pkr?: number | null;
          source_url?: string | null;
          source?: string | null;
          scraped_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['ev_vehicles']['Insert']>;
        Relationships: NeverRelationships;
      };
      app_maintenance: {
        Row: {
          id: boolean;
          enabled: boolean;
          message: string | null;
          starts_at: string | null;
          ends_at: string | null;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: boolean;
          enabled?: boolean;
          message?: string | null;
          starts_at?: string | null;
          ends_at?: string | null;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['app_maintenance']['Insert']>;
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
