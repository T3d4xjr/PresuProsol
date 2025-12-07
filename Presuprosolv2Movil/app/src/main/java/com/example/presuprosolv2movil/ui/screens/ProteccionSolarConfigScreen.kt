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
import com.example.presuprosolv2movil.utils.ProteccionSolarPricing
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProteccionSolarConfigScreen(
    navController: NavController,
    tipo: String
) {
    var isLoading by remember { mutableStateOf(true) }
    var catalogo by remember { mutableStateOf<proteccionSolarTablas?>(null) }
    var descuentoCliente by remember { mutableStateOf(0.0) }

    var altoMm by remember { mutableStateOf("") }
    var anchoMm by remember { mutableStateOf("") }
    var modeloSeleccionado by remember { mutableStateOf<ModeloXX?>(null) }
    var colorSeleccionado by remember { mutableStateOf<ColoreX?>(null) }
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

            val catalogoResult = ProductosRepository.getProteccionSolarCatalogo()
            catalogo = catalogoResult.getOrNull()

            val userId = AuthManager.getCurrentUserId()
            if (!userId.isNullOrEmpty()) {
                val descResult = ProductosRepository.getDescuentoCliente(userId)
                descuentoCliente = descResult.getOrNull() ?: 0.0
            }

            isLoading = false
        }
    }

    LaunchedEffect(altoMm, anchoMm, modeloSeleccionado, colorSeleccionado, accesoriosSeleccionados) {
        val alto = altoMm.toIntOrNull() ?: 0
        val ancho = anchoMm.toIntOrNull() ?: 0

        if (alto > 0 && ancho > 0 && modeloSeleccionado != null && colorSeleccionado != null) {
            // Calcular área
            areaM2 = ProteccionSolarPricing.calcAreaM2(alto, ancho)

            // TODO: Obtener precio desde Supabase usando fetchPrecioProteccionSolar
            // Por ahora usar precio estimado de 35€/m2 (como en el ejemplo de JavaScript)
            precioM2 = 35.0
            precioBase = precioM2 * areaM2

            // Calcular total de accesorios
            totalAccesorios = ProteccionSolarPricing.calcAccesoriosTotal(accesoriosSeleccionados)

            // Calcular subtotal
            subtotal = precioBase + totalAccesorios

            // Aplicar descuento
            total = ProteccionSolarPricing.applyDiscount(subtotal, descuentoCliente)
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
                            catalogo!!.modelos?.forEach { modelo ->
                                DropdownMenuItem(
                                    text = { Text(modelo.nombre) },
                                    onClick = {
                                        modeloSeleccionado = modelo
                                        colorSeleccionado = null
                                        expandedModelo = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Selección de color
                if (modeloSeleccionado != null) {
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
                                    text = { Text(color.nombre) },
                                    onClick = {
                                        colorSeleccionado = color
                                        expandedColor = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Resumen
                if (colorSeleccionado != null && precioBase > 0) {
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

                            if (precioM2 > 0) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Precio por m²:")
                                    Text("${String.format(Locale.US, "%.2f", precioM2)}€")
                                }
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
                } else if (colorSeleccionado != null && precioBase == 0.0) {
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
        "proteccion-solar-ventuszip01" -> "Stor Ventus ZIP"
        "proteccion-solar-Stor-disaluz" -> "Stor Disaluz"
        "proteccion-solar-Stor-vilaluz" -> "Stor Vilaluz"
        else -> "Protección Solar"
    }
}

