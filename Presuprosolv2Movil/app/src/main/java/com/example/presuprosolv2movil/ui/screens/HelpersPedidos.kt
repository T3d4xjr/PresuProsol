package com.example.presuprosolv2movil.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun EstadoPedidoChip(estado: String) {
    val (label, bg, icon) = when (estado.lowercase()) {
        "en proceso", "en_proceso" -> Triple("En proceso", Color(0xFFFFA000), "⏳")
        "enviando" -> Triple("Enviando", Color(0xFF2196F3), "📤")
        "entregado" -> Triple("Entregado", Color(0xFF4CAF50), "✅")
        else -> Triple(estado, Color(0xFF9E9E9E), "📦")
    }

    Surface(
        color = bg,
        shape = MaterialTheme.shapes.small
    ) {
        Row(modifier = Modifier.padding(8.dp)) {
            Text("$icon $label", color = Color.White, fontSize = 12.sp)
        }
    }
}

@Composable
fun DetailRowPedido(label: String, value: String) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, fontSize = 12.sp, color = Color(0xFF757575))
        Text(value, fontSize = 12.sp)
    }
}

fun formatFechaPedido(fecha: String): String {
    return try {
        val d = fecha.split("T")[0]
        val input = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val output = SimpleDateFormat("d/M/yyyy", Locale.getDefault())
        output.format(input.parse(d) ?: Date())
    } catch (_: Exception) {
        fecha
    }
}

fun getNombreCategoriaPedido(tipo: String): String {
    return when (tipo) {
        "mosquitera-corredera" -> "Mosquitera Corredera"
        "mosquitera-enrollable" -> "Mosquitera Enrollable"
        "mosquitera-fija" -> "Mosquitera Fija"
        "mosquitera-plisada" -> "Mosquitera Plisada"
        "pano-enrollable" -> "Paño Enrollable"
        "pano-plisado" -> "Paño Plisado"
        "compacto-cajonfrontal" -> "Compacto Cajón Frontal"
        "compacto-minimo" -> "Compacto Mínimo"
        "compacto-monoblock" -> "Compacto Monoblock"
        "compacto-pvc" -> "Compacto PVC"
        "compacto-aluminio" -> "Compacto Aluminio"
        "proteccion-solar-enrollable" -> "Protección Solar Enrollable"
        "proteccion-solar-lateral" -> "Protección Solar Lateral"
        "proteccion-solar-ventuszip01" -> "Protección Solar VentusZip"
        "proteccion-solar-stor-disaluz" -> "Protección Solar Stor"
        "puerta-seccional-residencial" -> "Puerta Seccional Residencial"
        "puerta-seccional-industrial" -> "Puerta Seccional Industrial"
        "pergola-bioclimatica" -> "Pérgola Bioclimática"
        else -> tipo
    }
}
