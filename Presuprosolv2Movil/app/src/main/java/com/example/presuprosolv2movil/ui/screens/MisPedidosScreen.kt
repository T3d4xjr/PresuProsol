package com.example.presuprosolv2movil.ui.screens

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.data.models.Pedido
import com.example.presuprosolv2movil.data.repositories.GeneralRepository
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MisPedidosScreen(navController: NavController) {
    var pedidos by remember { mutableStateOf<List<Pedido>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true
            val userId = AuthManager.getCurrentUserId()
            Log.d("MisPedidosScreen", "🔍 UserId obtenido: $userId")

            if (!userId.isNullOrBlank()) {
                pedidos = GeneralRepository.fetchPedidosUsuario(userId)

                Log.d("MisPedidosScreen", "📦 Total pedidos cargados: ${pedidos.size}")

                pedidos.forEachIndexed { index, pedido ->
                    Log.d("MisPedidosScreen", "═══════════════════════════════════════")
                    Log.d("MisPedidosScreen", "📦 Pedido #$index:")
                    Log.d("MisPedidosScreen", "  - ID: ${pedido.id}")
                    Log.d("MisPedidosScreen", "  - Presupuesto ID: ${pedido.presupuestoId}")
                    Log.d("MisPedidosScreen", "  - Total: ${pedido.total}")
                    Log.d("MisPedidosScreen", "  - Estado: ${pedido.estado}")
                    Log.d("MisPedidosScreen", "  - Fecha: ${pedido.createdAt}")

                    // LOGS DETALLADOS DEL PRESUPUESTO RELACIONADO
                    if (pedido.presupuestos != null) {
                        Log.d("MisPedidosScreen", "  ✅ Presupuesto encontrado:")
                        Log.d("MisPedidosScreen", "    - Tipo: '${pedido.presupuestos.tipo}'")
                        Log.d("MisPedidosScreen", "    - Cliente: '${pedido.presupuestos.cliente}'")
                        Log.d("MisPedidosScreen", "    - Email: '${pedido.presupuestos.email}'")
                        Log.d("MisPedidosScreen", "    - Alto: ${pedido.presupuestos.altoMm}")
                        Log.d("MisPedidosScreen", "    - Ancho: ${pedido.presupuestos.anchoMm}")
                        Log.d("MisPedidosScreen", "    - Color: '${pedido.presupuestos.color}'")
                    } else {
                        Log.e("MisPedidosScreen", "  ❌ Presupuesto es NULL")
                    }
                    Log.d("MisPedidosScreen", "═══════════════════════════════════════")
                }
            } else {
                Log.e("MisPedidosScreen", "❌ UserId está vacío o es null")
            }

            isLoading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("📦 Mis Pedidos", color = Color.White) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2D2A6E)
                )
            )
        }
    ) { padding ->

        when {
            isLoading -> LoadingPedidos(padding)
            pedidos.isEmpty() -> EmptyPedidos(padding)
            else -> LazyColumn(
                modifier = Modifier.padding(padding),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(pedidos) { pedido -> PedidoItem(pedido) }
            }
        }
    }
}

@Composable
fun LoadingPedidos(padding: PaddingValues) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = Color(0xFFFF6600))
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun EmptyPedidos(padding: PaddingValues) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                Icons.Default.ShoppingCart,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = Color(0xFFBDBDBD)
            )
            Spacer(modifier = Modifier.height(16.dp))
            Text("No tienes pedidos aún", fontSize = 18.sp, color = Color(0xFF757575))
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Los pedidos aparecerán aquí una vez que pagues tus presupuestos",
                fontSize = 14.sp,
                color = Color(0xFF9E9E9E)
            )
        }
    }
}
