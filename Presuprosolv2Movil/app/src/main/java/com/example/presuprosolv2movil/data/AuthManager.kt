package com.example.presuprosolv2movil.data

import android.util.Log
import io.github.jan.supabase.gotrue.auth
import io.github.jan.supabase.gotrue.providers.builtin.Email
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

@Serializable
data class SessionResponse(
    val access_token: String,
    val user: UserData? = null
)

@Serializable
data class UserData(
    val id: String,
    val email: String
)

object AuthManager {
    private const val TAG = "AuthManager"
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val supabase = SupabaseClient.client

    private val _session = MutableStateFlow<SessionResponse?>(null)
    val session: StateFlow<SessionResponse?> = _session

    private val _loading = MutableStateFlow(false)
    val loading: StateFlow<Boolean> = _loading

    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error

    val isAuthenticated: Boolean
        get() = _session.value?.access_token != null

    init {
        scope.launch {
            try {
                val currentSession = supabase.auth.currentSessionOrNull()
                if (currentSession != null) {
                    _session.value = SessionResponse(
                        access_token = currentSession.accessToken,
                        user = UserData(
                            id = currentSession.user?.id ?: "",
                            email = currentSession.user?.email ?: ""
                        )
                    )
                    Log.d(TAG, "Sesión existente recuperada")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error checking existing session", e)
            }
        }
    }

    fun signIn(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        scope.launch {
            _loading.value = true
            _error.value = null

            try {
                Log.d(TAG, "Intentando login para: $email")

                // Login con Supabase Auth
                supabase.auth.signInWith(Email) {
                    this.email = email
                    this.password = password
                }

                val currentSession = supabase.auth.currentSessionOrNull()
                    ?: throw Exception("No se pudo obtener la sesión")

                val userId = currentSession.user?.id ?: throw Exception("Usuario no encontrado")

                _session.value = SessionResponse(
                    access_token = currentSession.accessToken,
                    user = UserData(
                        id = userId,
                        email = currentSession.user?.email ?: email
                    )
                )

                Log.d(TAG, "Login exitoso para: $email")

                // Ejecutar callback en el hilo Main
                withContext(Dispatchers.Main) {
                    onResult(true, null)
                }

            } catch (e: Exception) {
                // Log detallado del error completo
                Log.e(TAG, "Error en login - Tipo: ${e::class.simpleName}", e)
                Log.e(TAG, "Error en login - Mensaje completo: ${e.message}")
                Log.e(TAG, "Error en login - Causa: ${e.cause?.message}")

                val errorMsg = when {
                    // Errores de red
                    e.message?.contains("Unable to resolve host", ignoreCase = true) == true ->
                        "Error de conexión. Verifica tu conexión a Internet"
                    e.message?.contains("timeout", ignoreCase = true) == true ->
                        "Tiempo de espera agotado. Verifica tu conexión"
                    e.message?.contains("network", ignoreCase = true) == true ->
                        "Error de red. Verifica tu conexión a Internet"

                    // Errores de autenticación específicos de Supabase
                    e.message?.contains("Invalid login credentials", ignoreCase = true) == true ->
                        "Esta cuenta no existe o la contraseña es incorrecta"
                    e.message?.contains("invalid_grant", ignoreCase = true) == true ->
                        "Email o contraseña incorrectos"
                    e.message?.contains("Email not confirmed", ignoreCase = true) == true ->
                        "Debes confirmar tu email primero"
                    e.message?.contains("User not found", ignoreCase = true) == true ->
                        "Esta cuenta no está registrada en el sistema"
                    e.message?.contains("Invalid email", ignoreCase = true) == true ->
                        "El formato del email no es válido"
                    e.message?.contains("email rate limit", ignoreCase = true) == true ->
                        "Demasiados intentos. Espera un momento e intenta de nuevo"

                    // Si no coincide con ninguno, mostrar el error original para debugging
                    else -> {
                        Log.w(TAG, "Error no categorizado, mostrando mensaje original")
                        "Error: ${e.message ?: "Error desconocido al iniciar sesión"}"
                    }
                }

                _error.value = errorMsg

                // Ejecutar callback en el hilo Main
                withContext(Dispatchers.Main) {
                    onResult(false, errorMsg)
                }
            } finally {
                _loading.value = false
            }
        }
    }

    fun signOut(onResult: (Boolean) -> Unit = {}) {
        scope.launch {
            _loading.value = true
            try {
                supabase.auth.signOut()
                _session.value = null
                _error.value = null
                Log.d(TAG, "Logout exitoso")

                // Ejecutar callback en el hilo Main
                withContext(Dispatchers.Main) {
                    onResult(true)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error en logout", e)

                // Ejecutar callback en el hilo Main
                withContext(Dispatchers.Main) {
                    onResult(false)
                }
            } finally {
                _loading.value = false
            }
        }
    }

    fun clearError() {
        _error.value = null
    }

    fun getCurrentUserId(): String? {
        return _session.value?.user?.id
    }
}
