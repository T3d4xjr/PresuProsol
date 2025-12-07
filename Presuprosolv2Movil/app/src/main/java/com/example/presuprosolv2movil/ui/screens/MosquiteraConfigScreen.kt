package com.example.presuprosolv2movil.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.data.models.*
import com.example.presuprosolv2movil.data.repositories.MosquiterasRepository
import com.example.presuprosolv2movil.data.repositories.ProductosRepository
import com.example.presuprosolv2movil.utils.AccesorioSeleccionado
import com.example.presuprosolv2movil.utils.MosquiterasPricing
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MosquiteraConfigScreen(
    navController: NavController,
    tipo: String
) {
    var isLoading by remember { mutableStateOf(true) }
    var catalogo by remember { mutableStateOf<mosquiterasTablas?>(null) }
    var descuentoCliente by remember { mutableStateOf(0.0) }

    // Estados del formulario
    var altoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var anchoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var colorSeleccionado by remember { mutableStateOf<Colore?>(null) }
    var accesoriosSeleccionados by remember { mutableStateOf<List<AccesorioSeleccionado>>(emptyList()) }

    // Precio base y cálculos
    var precioBase by remember { mutableStateOf(0.0) }
    var incrementoColor by remember { mutableStateOf(0.0) }
    var totalAccesorios by remember { mutableStateOf(0.0) }
    var subtotal by remember { mutableStateOf(0.0) }
    var total by remember { mutableStateOf(0.0) }

    val scope = rememberCoroutineScope()

    // Cargar catálogo al iniciar
    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true

            // Cargar catálogo
            val catalogoResult = ProductosRepository.getMosquiterasCatalogo()
            catalogo = catalogoResult.getOrNull()

            // Cargar descuento del cliente
            val userId = AuthManager.getCurrentUserId()
            if (!userId.isNullOrEmpty()) {
                val descResult = ProductosRepository.getDescuentoCliente(userId)
                descuentoCliente = descResult.getOrNull() ?: 0.0
            }

            isLoading = false
        }
    }

    // Recalcular precios cuando cambian los valores
    LaunchedEffect(altoSeleccionado, anchoSeleccionado, colorSeleccionado, accesoriosSeleccionados) {
        if (altoSeleccionado != null && anchoSeleccionado != null) {
            scope.launch {
                // Obtener precio base desde Supabase
                val precioFromDb = MosquiterasRepository.getMosqBasePrice(
                    altoSeleccionado!!,
                    anchoSeleccionado!!
                )
                precioBase = precioFromDb ?: 0.0

                // Calcular incremento por color
                incrementoColor = if (colorSeleccionado != null) {
                    MosquiterasPricing.calcColorIncrement(
                        altoSeleccionado!!,
                        anchoSeleccionado!!,
                        colorSeleccionado!!.incrementoEurMl
                    )
                } else {
                    0.0
                }

                // Calcular total de accesorios
                totalAccesorios = MosquiterasPricing.calcAccesoriosTotal(accesoriosSeleccionados)

                // Calcular subtotal
                subtotal = precioBase + incrementoColor + totalAccesorios

                // Aplicar descuento
                total = MosquiterasPricing.applyDiscount(subtotal, descuentoCliente)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        getTipoNombre(tipo),
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2D2A6E)
                )
            )
        }
    ) { padding ->
        if (isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Color(0xFFFF6600))
            }
        } else if (catalogo == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("Error cargando catálogo")
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Selección de medidas
                Text(
                    "Medidas",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                // Alto
                var expandedAlto by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = expandedAlto,
                    onExpandedChange = { expandedAlto = it }
                ) {
                    OutlinedTextField(
                        value = altoSeleccionado?.let { "$it mm" } ?: "",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Alto") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedAlto) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFFF6600),
                            focusedLabelColor = Color(0xFFFF6600)
                        )
                    )

                    ExposedDropdownMenu(
                        expanded = expandedAlto,
                        onDismissRequest = { expandedAlto = false }
                    ) {
                        catalogo!!.medidas?.altos?.forEach { alto ->
                            DropdownMenuItem(
                                text = { Text("$alto mm") },
                                onClick = {
                                    altoSeleccionado = alto
                                    anchoSeleccionado = null // Reset ancho
                                    expandedAlto = false
                                }
                            )
                        }
                    }
                }

                // Ancho (solo si hay alto seleccionado)
                if (altoSeleccionado != null) {
                    // Filtrar anchos válidos para el alto seleccionado
                    val anchosDisponibles = catalogo!!.medidas?.anchos?.filter { ancho ->
                        catalogo!!.medidas?.combinaciones?.any {
                            it.alto == altoSeleccionado && it.ancho == ancho
                        } ?: false
                    } ?: emptyList()

                    var expandedAncho by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expandedAncho,
                        onExpandedChange = { expandedAncho = it }
                    ) {
                        OutlinedTextField(
                            value = anchoSeleccionado?.let { "$it mm" } ?: "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Ancho") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedAncho) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6600),
                                focusedLabelColor = Color(0xFFFF6600)
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedAncho,
                            onDismissRequest = { expandedAncho = false }
                        ) {
                            anchosDisponibles.forEach { ancho ->
                                DropdownMenuItem(
                                    text = { Text("$ancho mm") },
                                    onClick = {
                                        anchoSeleccionado = ancho
                                        expandedAncho = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Selección de color
                if (anchoSeleccionado != null) {
                    HorizontalDivider()

                    Text(
                        "Color",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    var expandedColor by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expandedColor,
                        onExpandedChange = { expandedColor = it }
                    ) {
                        OutlinedTextField(
                            value = colorSeleccionado?.nombre ?: "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Selecciona un color") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedColor) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6600),
                                focusedLabelColor = Color(0xFFFF6600)
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedColor,
                            onDismissRequest = { expandedColor = false }
                        ) {
                            catalogo!!.colores?.forEach { color ->
                                DropdownMenuItem(
                                    text = {
                                        Text("${color.nombre} (+${String.format(Locale.US, "%.2f", 
                                            MosquiterasPricing.calcColorIncrement(
                                                altoSeleccionado!!,
                                                anchoSeleccionado!!,
                                                color.incrementoEurMl
                                            )
                                        )}€)")
                                    },
                                    onClick = {
                                        colorSeleccionado = color
                                        expandedColor = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Resumen de precios
                if (colorSeleccionado != null) {
                    HorizontalDivider()

                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFFF5F5F5)
                        )
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                "Resumen",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Precio base:")
                                Text("${String.format(Locale.US, "%.2f", precioBase)}€")
                            }

                            if (incrementoColor > 0) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Incremento color:")
                                    Text("+${String.format(Locale.US, "%.2f", incrementoColor)}€")
                                }
                            }

                            if (totalAccesorios > 0) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Accesorios:")
                                    Text("+${String.format(Locale.US, "%.2f", totalAccesorios)}€")
                                }
                            }

                            HorizontalDivider()

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Subtotal:")
                                Text("${String.format(Locale.US, "%.2f", subtotal)}€", fontWeight = FontWeight.Bold)
                            }

                            if (descuentoCliente > 0) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Descuento (${String.format(Locale.US, "%.0f", descuentoCliente)}%):")
                                    Text("-${String.format(Locale.US, "%.2f", subtotal - total)}€", color = Color(0xFF4CAF50))
                                }
                            }

                            HorizontalDivider()

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("TOTAL:", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                                Text(
                                    "${String.format(Locale.US, "%.2f", total)}€",
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFF6600)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Button(
                        onClick = {
                            // TODO: Guardar presupuesto
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFF6600)
                        )
                    ) {
                        Text("Guardar Presupuesto")
                    }
                }
            }
        }
    }
}

private fun getTipoNombre(tipo: String): String {
    return when (tipo) {
        "mosquitera-corredera" -> "Mosquitera Corredera"
        "mosquitera-fija" -> "Mosquitera Fija"
        "mosquitera-enrollable" -> "Mosquitera Enrollable"
        else -> "Mosquitera"
    }
}

