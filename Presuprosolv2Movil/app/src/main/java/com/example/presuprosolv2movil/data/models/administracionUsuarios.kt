package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * Modelo para la tabla administracion_usuarios en Supabase
 * Esta tabla contiene los datos de usuarios administrados (solicitudes de acceso)
 */
@Serializable
data class AdministracionUsuario(
    @SerialName("id")
    val id: String = "",
    @SerialName("auth_user_id")
    val authUserId: String? = null,
    @SerialName("usuario")
    val usuario: String = "",
    @SerialName("email")
    val email: String = "",
    @SerialName("cif")
    val cif: String = "",
    @SerialName("habilitado")
    val habilitado: Boolean = false,
    @SerialName("rol")
    val rol: String = "usuario",
    @SerialName("descuento")
    val descuento: Int? = null,
    @SerialName("descuento_cliente")
    val descuentoCliente: Int? = null,
    @SerialName("created_at")
    val createdAt: String = "",
    @SerialName("updated_at")
    val updatedAt: String? = null
)

/**
 * Respuesta de API para lista de usuarios de administración
 */
@Serializable
data class AdministracionUsuariosResponse(
    @SerialName("usuarios")
    val usuarios: List<AdministracionUsuario> = emptyList()
)