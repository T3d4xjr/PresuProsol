package com.example.presuprosolv2movil.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.data.models.*
import com.example.presuprosolv2movil.data.repositories.ProductosRepository
import com.example.presuprosolv2movil.utils.AccesorioSeleccionado
import com.example.presuprosolv2movil.utils.PanosCompactosPricing
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PanoConfigScreen(
    navController: NavController,
    tipo: String
) {
    var isLoading by remember { mutableStateOf(true) }
    var catalogo by remember { mutableStateOf<panosTablas?>(null) }
    var descuentoCliente by remember { mutableStateOf(0.0) }

    var altoMm by remember { mutableStateOf("") }
    var anchoMm by remember { mutableStateOf("") }
    var modeloSeleccionado by remember { mutableStateOf<Modelo?>(null) }
    var acabadoSeleccionado by remember { mutableStateOf<Acabado?>(null) }
    var accesoriosSeleccionados by remember { mutableStateOf<List<AccesorioSeleccionado>>(emptyList()) }

    var precioM2 by remember { mutableStateOf(0.0) }
    var areaM2 by remember { mutableStateOf(0.0) }
    var precioBase by remember { mutableStateOf(0.0) }
    var totalAccesorios by remember { mutableStateOf(0.0) }
    var subtotal by remember { mutableStateOf(0.0) }
    var total by remember { mutableStateOf(0.0) }

    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true

            val catalogoResult = ProductosRepository.getPanosCatalogo()
            catalogo = catalogoResult.getOrNull()

            // Debug: Log para ver qué datos llegaron
            catalogo?.let { cat ->
                println("📦 [PanoConfig] Modelos cargados: ${cat.modelos?.size ?: 0}")
                cat.modelos?.forEach { modelo ->
                    println("   - Modelo: ${modelo.nombre}, tipo: '${modelo.tipo}'")
                }
                println("📦 [PanoConfig] Acabados cargados: ${cat.acabados?.size ?: 0}")
                println("📦 [PanoConfig] Tipo recibido en navegación: '$tipo'")
            }

            val userId = AuthManager.getCurrentUserId()
            if (!userId.isNullOrEmpty()) {
                val descResult = ProductosRepository.getDescuentoCliente(userId)
                descuentoCliente = descResult.getOrNull() ?: 0.0
            }

            isLoading = false
        }
    }

    LaunchedEffect(altoMm, anchoMm, modeloSeleccionado, acabadoSeleccionado, accesoriosSeleccionados) {
        val alto = altoMm.toIntOrNull() ?: 0
        val ancho = anchoMm.toIntOrNull() ?: 0

        if (alto > 0 && ancho > 0 && modeloSeleccionado != null && acabadoSeleccionado != null) {
            // Calcular área
            areaM2 = PanosCompactosPricing.calcAreaM2(alto, ancho)

            // TODO: Obtener precio desde Supabase usando getPanoPricePerM2
            // Por ahora usar precio estimado de 45€/m2
            precioM2 = 45.0

            // Calcular precio base
            precioBase = precioM2 * areaM2

            // Calcular total de accesorios
            totalAccesorios = PanosCompactosPricing.calcAccesoriosTotal(accesoriosSeleccionados)

            // Calcular subtotal
            subtotal = precioBase + totalAccesorios

            // Aplicar descuento
            total = PanosCompactosPricing.applyDiscount(subtotal, descuentoCliente)
        } else {
            precioBase = 0.0
            subtotal = 0.0
            total = 0.0
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
                Text(
                    "Medidas Personalizadas",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                // Alto
                OutlinedTextField(
                    value = altoMm,
                    onValueChange = { altoMm = it },
                    label = { Text("Alto (mm)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFFFF6600),
                        focusedLabelColor = Color(0xFFFF6600)
                    )
                )

                // Ancho
                OutlinedTextField(
                    value = anchoMm,
                    onValueChange = { anchoMm = it },
                    label = { Text("Ancho (mm)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Color(0xFFFF6600),
                        focusedLabelColor = Color(0xFFFF6600)
                    )
                )

                // Selección de modelo
                if (altoMm.isNotEmpty() && anchoMm.isNotEmpty()) {
                    HorizontalDivider()

                    Text(
                        "Modelo",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    var expandedModelo by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expandedModelo,
                        onExpandedChange = { expandedModelo = it }
                    ) {
                        OutlinedTextField(
                            value = modeloSeleccionado?.nombre ?: "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Selecciona un modelo") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedModelo) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6600),
                                focusedLabelColor = Color(0xFFFF6600)
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedModelo,
                            onDismissRequest = { expandedModelo = false }
                        ) {
                            // Filtrar por tipo, pero si está vacío mostrar todos
                            val modelosFiltrados = if (tipo.isNotEmpty()) {
                                catalogo!!.modelos?.filter { it.tipo.equals(tipo, ignoreCase = true) }
                            } else {
                                catalogo!!.modelos
                            }

                            if (modelosFiltrados.isNullOrEmpty()) {
                                // Si no hay modelos con el filtro, mostrar todos
                                catalogo!!.modelos?.forEach { modelo ->
                                    DropdownMenuItem(
                                        text = { Text("${modelo.nombre} (${modelo.tipo})") },
                                        onClick = {
                                            modeloSeleccionado = modelo
                                            acabadoSeleccionado = null
                                            expandedModelo = false
                                        }
                                    )
                                }
                            } else {
                                modelosFiltrados.forEach { modelo ->
                                    DropdownMenuItem(
                                        text = { Text(modelo.nombre) },
                                        onClick = {
                                            modeloSeleccionado = modelo
                                            acabadoSeleccionado = null
                                            expandedModelo = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                // Selección de acabado
                if (modeloSeleccionado != null) {
                    HorizontalDivider()

                    Text(
                        "Acabado",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )

                    var expandedAcabado by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expandedAcabado,
                        onExpandedChange = { expandedAcabado = it }
                    ) {
                        OutlinedTextField(
                            value = acabadoSeleccionado?.nombre ?: "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Selecciona un acabado") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedAcabado) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6600),
                                focusedLabelColor = Color(0xFFFF6600)
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedAcabado,
                            onDismissRequest = { expandedAcabado = false }
                        ) {
                            catalogo!!.acabados?.forEach { acabado ->
                                DropdownMenuItem(
                                    text = { Text(acabado.nombre) },
                                    onClick = {
                                        acabadoSeleccionado = acabado
                                        expandedAcabado = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Resumen
                if (acabadoSeleccionado != null && precioM2 > 0) {
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
                                Text("Área:")
                                Text("${String.format(Locale.US, "%.2f", areaM2)} m²")
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Precio por m²:")
                                Text("${String.format(Locale.US, "%.2f", precioM2)}€")
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Precio base:")
                                Text("${String.format(Locale.US, "%.2f", precioBase)}€")
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
                } else if (acabadoSeleccionado != null && precioM2 == 0.0) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFFFFF3CD)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Info,
                                contentDescription = null,
                                tint = Color(0xFFFFA000),
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                "No hay precio disponible para esta combinación. Consulta con nosotros.",
                                fontSize = 14.sp,
                                color = Color(0xFF856404)
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun getTipoNombre(tipo: String): String {
    return when (tipo) {
        "paño-pano" -> "Paño de Aluminio"
        "paño-lamas" -> "Lamas Sueltas"
        else -> "Paño de Persiana"
    }
}

