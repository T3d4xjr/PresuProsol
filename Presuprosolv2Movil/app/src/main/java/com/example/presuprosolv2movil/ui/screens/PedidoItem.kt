package com.example.presuprosolv2movil.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.presuprosolv2movil.data.models.Pedido
import java.util.*

@Composable
fun PedidoItem(pedido: Pedido) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(2.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {

            // ---------- HEADER ----------
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = formatFechaPedido(pedido.createdAt ?: ""),
                        fontSize = 12.sp,
                        color = Color(0xFF757575)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    val tipo = pedido.presupuestos?.tipo ?: ""
                    Text(
                        text = if (tipo.isNotEmpty()) getNombreCategoriaPedido(tipo) else "N/A",
                        fontSize = 16.sp,
                        color = Color(0xFF2D2A6E)
                    )
                }

                EstadoPedidoChip(pedido.estado ?: "Pendiente")
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ---------- DETALLES ----------
            pedido.presupuestos?.let { pres ->
                Card(colors = CardDefaults.cardColors(Color(0xFFF5F5F5))) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text("Detalles", fontSize = 12.sp, color = Color(0xFF757575))
                        Spacer(modifier = Modifier.height(8.dp))

                        if (pres.altoMm > 0 && pres.anchoMm > 0)
                            DetailRowPedido("Medidas", "${pres.altoMm} × ${pres.anchoMm} mm")

                        if (!pres.color.isNullOrEmpty())
                            DetailRowPedido("Color", pres.color)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            HorizontalDivider()

            Spacer(modifier = Modifier.height(16.dp))

            // ---------- TOTAL ----------
            Text("TOTAL", fontSize = 12.sp, color = Color(0xFF757575))
            Text(
                "${String.format(Locale.US, "%.2f", pedido.total)} €",
                fontSize = 24.sp,
                color = Color(0xFFFF6600)
            )
        }
    }
}


