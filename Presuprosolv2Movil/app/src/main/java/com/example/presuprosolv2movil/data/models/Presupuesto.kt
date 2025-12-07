package com.example.presuprosolv2movil.data.models


import com.google.gson.annotations.SerializedName
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Presupuesto(
    @SerializedName("acabado")
    @SerialName("acabado")
    val acabado: String? = null,
    @SerializedName("accesorios")
    @SerialName("accesorios")
    val accesorios: List<Accesorio> = emptyList(),
    @SerializedName("alto_mm")
    @SerialName("alto_mm")
    val altoMm: Int = 0,
    @SerializedName("ancho_mm")
    @SerialName("ancho_mm")
    val anchoMm: Int = 0,
    @SerializedName("cif")
    @SerialName("cif")
    val cif: String? = null,
    @SerializedName("cliente")
    @SerialName("cliente")
    val cliente: String? = null,
    @SerializedName("color")
    @SerialName("color")
    val color: String? = null,
    @SerializedName("color_precio")
    @SerialName("color_precio")
    val colorPrecio: Double = 0.0,
    @SerializedName("created_at")
    @SerialName("created_at")
    val createdAt: String = "",
    @SerializedName("descuento_cliente")
    @SerialName("descuento_cliente")
    val descuentoCliente: Double = 0.0,
    @SerializedName("email")
    @SerialName("email")
    val email: String? = null,
    @SerializedName("fecha_desactualizacion")
    @SerialName("fecha_desactualizacion")
    val fechaDesactualizacion: String? = null,
    @SerializedName("fondo_mm")
    @SerialName("fondo_mm")
    val fondo_mm: Int = 0,
    @SerializedName("id")
    @SerialName("id")
    val id: String = "",
    @SerializedName("invalidado")
    @SerialName("invalidado")
    val invalidado: Boolean = false,
    @SerializedName("medida_precio")
    @SerialName("medida_precio")
    val medidaPrecio: Double = 0.0,
    @SerializedName("modelo")
    @SerialName("modelo")
    val modelo: String? = null,
    @SerializedName("pagado")
    @SerialName("pagado")
    val pagado: Boolean = false,
    @SerializedName("precio_desactualizado")
    @SerialName("precio_desactualizado")
    val precioDesactualizado: Boolean = false,
    @SerializedName("razon_invalidacion")
    @SerialName("razon_invalidacion")
    val razonInvalidacion: String? = null,
    @SerializedName("subtotal")
    @SerialName("subtotal")
    val subtotal: Double = 0.0,
    @SerializedName("tipo")
    @SerialName("tipo")
    val tipo: String = "",
    @SerializedName("total")
    @SerialName("total")
    val total: Double = 0.0,
    @SerializedName("updated_at")
    @SerialName("updated_at")
    val updatedAt: String = "",
    @SerializedName("user_id")
    @SerialName("user_id")
    val userId: String = ""
) {
    // Propiedades auxiliares para las vistas
    val estado: String
        get() = when {
            pagado -> "pagado"
            invalidado -> "rechazado"
            precioDesactualizado -> "pendiente"
            else -> "aprobado"
        }

    val titulo: String
        get() = "$tipo - ${modelo ?: ""}"

    val detalles: String
        get() = buildString {
            append("Medidas: ${altoMm}mm x ${anchoMm}mm")
            if (!color.isNullOrEmpty()) append(" | Color: $color")
            if (!acabado.isNullOrEmpty()) append(" | Acabado: $acabado")
        }

    val fecha: String
        get() = createdAt.split("T").firstOrNull() ?: createdAt
}
