package com.example.presuprosolv2movil.data.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Pedido(
    @SerialName("id")
    val id: String = "",
    @SerialName("user_id")
    val userId: String = "",
    @SerialName("presupuesto_id")
    val presupuestoId: String = "",
    @SerialName("total")
    val total: Double = 0.0,
    @SerialName("estado")
    val estado: String? = "Pendiente",
    @SerialName("created_at")
    val createdAt: String? = "",
    @SerialName("updated_at")
    val updatedAt: String = "",
    @SerialName("direccion_entrega")
    val direccionEntrega: String = "",
    @SerialName("fecha_entrega")
    val fechaEntrega: String? = null,
    @SerialName("presupuestos")
    val presupuestos: Presupuestos? = null
) {
    // Propiedades auxiliares para las vistas
    val numeroOrden: String
        get() = "Pedido #${id.takeLast(8).uppercase()}"

    val fecha: String
        get() = createdAt?.split("T")?.firstOrNull() ?: createdAt ?: ""
}
