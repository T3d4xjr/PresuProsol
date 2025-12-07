package com.example.presuprosolv2movil.data

import android.util.Log
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest

object SupabaseClient {
    private const val TAG = "SupabaseClient"
    private const val SUPABASE_URL = "https://vmbvmkrawjeedhhfhzdh.supabase.co"
    private const val SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtYnZta3Jhd2plZWRoaGZoemRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwMjQ1MTQsImV4cCI6MjA3NzYwMDUxNH0.bQovfR2X-wSsDW0ZJ_xGb0ra7MvUgfq41C5ytPb9-fk"

    val client = createSupabaseClient(
        supabaseUrl = SUPABASE_URL,
        supabaseKey = SUPABASE_KEY
    ) {
        install(Auth)
        install(Postgrest)
    }

    init {
        Log.d(TAG, "SupabaseClient inicializado con URL: $SUPABASE_URL")
    }
}

