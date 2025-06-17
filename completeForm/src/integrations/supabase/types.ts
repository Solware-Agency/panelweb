export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      a_usuarios: {
        Row: {
          automatizaciones_sugeridas: string[] | null
          historial: Json | null
          nombre_cliente: string | null
          tipo_negocio: string | null
          user_id: string
        }
        Insert: {
          automatizaciones_sugeridas?: string[] | null
          historial?: Json | null
          nombre_cliente?: string | null
          tipo_negocio?: string | null
          user_id: string
        }
        Update: {
          automatizaciones_sugeridas?: string[] | null
          historial?: Json | null
          nombre_cliente?: string | null
          tipo_negocio?: string | null
          user_id?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          areas: string[] | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          sector: string | null
        }
        Insert: {
          areas?: string[] | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          sector?: string | null
        }
        Update: {
          areas?: string[] | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          sector?: string | null
        }
        Relationships: []
      }
      GTR: {
        Row: {
          created_at: string
          id: number
          nombre: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          nombre?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          nombre?: string | null
        }
        Relationships: []
      }
      json: {
        Row: {
          Categoria: string | null
          Comentario: string | null
          Ejemplo: string | null
          ID: string
          Nodos: string | null
          Nombre: string | null
          Price: string | null
          Score: number | null
          Solucion: string | null
          Tipo: string | null
        }
        Insert: {
          Categoria?: string | null
          Comentario?: string | null
          Ejemplo?: string | null
          ID: string
          Nodos?: string | null
          Nombre?: string | null
          Price?: string | null
          Score?: number | null
          Solucion?: string | null
          Tipo?: string | null
        }
        Update: {
          Categoria?: string | null
          Comentario?: string | null
          Ejemplo?: string | null
          ID?: string
          Nodos?: string | null
          Nombre?: string | null
          Price?: string | null
          Score?: number | null
          Solucion?: string | null
          Tipo?: string | null
        }
        Relationships: []
      }
      registration_submissions: {
        Row: {
          age: string | null
          best_time_to_trade: string | null
          country: string | null
          created_at: string
          email: string
          financial_goals: string | null
          full_name: string
          hfm_id: string | null
          id: string
          operating_time: string | null
          phone: string | null
          risk_knowledge: string | null
          starting_capital: string | null
          traded_assets: string | null
          trading_session: string | null
          trading_style: string | null
        }
        Insert: {
          age?: string | null
          best_time_to_trade?: string | null
          country?: string | null
          created_at?: string
          email: string
          financial_goals?: string | null
          full_name: string
          hfm_id?: string | null
          id?: string
          operating_time?: string | null
          phone?: string | null
          risk_knowledge?: string | null
          starting_capital?: string | null
          traded_assets?: string | null
          trading_session?: string | null
          trading_style?: string | null
        }
        Update: {
          age?: string | null
          best_time_to_trade?: string | null
          country?: string | null
          created_at?: string
          email?: string
          financial_goals?: string | null
          full_name?: string
          hfm_id?: string | null
          id?: string
          operating_time?: string | null
          phone?: string | null
          risk_knowledge?: string | null
          starting_capital?: string | null
          traded_assets?: string | null
          trading_session?: string | null
          trading_style?: string | null
        }
        Relationships: []
      }
      "Tips Asesores": {
        Row: {
          "¿Enviado a Telegram?": boolean | null
          Fecha: string | null
          "Fuente (RSS)": string | null
          id: number
          "ID del artículo": string | null
          "Tip generado": string | null
        }
        Insert: {
          "¿Enviado a Telegram?"?: boolean | null
          Fecha?: string | null
          "Fuente (RSS)"?: string | null
          id?: number
          "ID del artículo"?: string | null
          "Tip generado"?: string | null
        }
        Update: {
          "¿Enviado a Telegram?"?: boolean | null
          Fecha?: string | null
          "Fuente (RSS)"?: string | null
          id?: number
          "ID del artículo"?: string | null
          "Tip generado"?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
