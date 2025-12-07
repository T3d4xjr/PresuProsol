package com.example.presuprosolv2movil.utils

import kotlin.math.max
import kotlin.math.round

/**
 * Utilidades para cálculo de precios de mosquiteras
 */
object MosquiterasPricing {

    /**
     * Cálculo de incremento por color: por perímetro (ml) * incremento_eur_ml
     */
    fun calcColorIncrement(altoMm: Int, anchoMm: Int, incrementoEurMl: Double): Double {
        val perimetroMl = (2 * (altoMm + anchoMm)) / 1000.0
        return round(perimetroMl * incrementoEurMl * 100) / 100.0
    }

    /**
     * Suma de accesorios seleccionados
     */
    fun calcAccesoriosTotal(accesorios: List<AccesorioSeleccionado>): Double {
        val total = accesorios.sumOf { it.precioUnit * it.unidades }
        return round(total * 100) / 100.0
    }

    /**
     * Aplica descuento (%) sobre subtotal
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return round(total * 100) / 100.0
    }
}

/**
 * Utilidades para cálculo de precios de paños y compactos
 */
object PanosCompactosPricing {

    /**
     * Superficie en m²
     */
    fun calcAreaM2(altoMm: Int, anchoMm: Int): Double {
        val area = max(0.0, (altoMm.toDouble() * anchoMm.toDouble()) / 1_000_000)
        return round(area * 100) / 100.0
    }

    /**
     * Suma de accesorios seleccionados
     */
    fun calcAccesoriosTotal(accesorios: List<AccesorioSeleccionado>): Double {
        val total = accesorios.sumOf { it.precioUnit * it.unidades }
        return round(total * 100) / 100.0
    }

    /**
     * Aplica descuento (%) a un subtotal
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return round(total * 100) / 100.0
    }
}

/**
 * Utilidades para cálculo de precios de protección solar
 */
object ProteccionSolarPricing {

    /**
     * Calcula el área en m²
     */
    fun calcAreaM2(altoMm: Int, anchoMm: Int): Double {
        val area = max(0.0, (altoMm.toDouble() * anchoMm.toDouble()) / 1_000_000)
        return round(area * 100) / 100.0
    }

    /**
     * Suma de accesorios seleccionados
     */
    fun calcAccesoriosTotal(accesorios: List<AccesorioSeleccionado>): Double {
        val total = accesorios.sumOf { it.precioUnit * it.unidades }
        return round(total * 100) / 100.0
    }

    /**
     * Aplica descuento (%) sobre subtotal
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return round(total * 100) / 100.0
    }
}

/**
 * Utilidades para cálculo de precios de puertas seccionales
 */
object PuertasPricing {

    /**
     * Calcula el área en m²
     */
    fun calcAreaM2(altoMm: Int, anchoMm: Int): Double {
        val area = max(0.0, (altoMm.toDouble() * anchoMm.toDouble()) / 1_000_000)
        return round(area * 100) / 100.0
    }

    /**
     * Suma de accesorios seleccionados
     */
    fun calcAccesoriosTotal(accesorios: List<AccesorioSeleccionado>): Double {
        val total = accesorios.sumOf { it.precioUnit * it.unidades }
        return round(total * 100) / 100.0
    }

    /**
     * Aplica descuento (%) sobre subtotal
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return round(total * 100) / 100.0
    }
}

/**
 * Utilidades para cálculo de precios de pérgolas
 */
object PergolasPricing {

    /**
     * Calcula el área en m²
     */
    fun calcAreaM2(anchoMm: Int, fondoMm: Int): Double {
        val area = max(0.0, (anchoMm.toDouble() * fondoMm.toDouble()) / 1_000_000)
        return round(area * 100) / 100.0
    }

    /**
     * Suma de accesorios seleccionados
     */
    fun calcAccesoriosTotal(accesorios: List<AccesorioSeleccionado>): Double {
        val total = accesorios.sumOf { it.precioUnit * it.unidades }
        return round(total * 100) / 100.0
    }

    /**
     * Aplica descuento (%) sobre subtotal
     */
    fun applyDiscount(subtotal: Double, descuentoPct: Double): Double {
        val total = subtotal * (1 - descuentoPct / 100)
        return round(total * 100) / 100.0
    }
}

/**
 * Modelo para accesorios seleccionados
 */
data class AccesorioSeleccionado(
    val id: String,
    val nombre: String,
    val unidades: Int,
    val precioUnit: Double
)

