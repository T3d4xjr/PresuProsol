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
import com.example.presuprosolv2movil.data.repositories.ProductosRepository
import com.example.presuprosolv2movil.utils.AccesorioSeleccionado
import com.example.presuprosolv2movil.utils.PergolasPricing
import kotlinx.coroutines.launch
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PergolaConfigScreen(
    navController: NavController,
    tipo: String
) {
    var isLoading by remember { mutableStateOf(true) }
    var catalogo by remember { mutableStateOf<pergolasTablas?>(null) }
    var descuentoCliente by remember { mutableStateOf(0.0) }

    var anchoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var fondoSeleccionado by remember { mutableStateOf<Int?>(null) }
    var colorSeleccionado by remember { mutableStateOf<ColoreXXX?>(null) }
    var accesoriosSeleccionados by remember { mutableStateOf<List<AccesorioSeleccionado>>(emptyList()) }

    var precioBase by remember { mutableStateOf(0.0) }
    var areaM2 by remember { mutableStateOf(0.0) }
    var incrementoColor by remember { mutableStateOf(0.0) }
    var totalAccesorios by remember { mutableStateOf(0.0) }
    var subtotal by remember { mutableStateOf(0.0) }
    var total by remember { mutableStateOf(0.0) }

    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        scope.launch {
            isLoading = true

            val catalogoResult = ProductosRepository.getPergolasCatalogo()
            catalogo = catalogoResult.getOrNull()

            val userId = AuthManager.getCurrentUserId()
            if (!userId.isNullOrEmpty()) {
                val descResult = ProductosRepository.getDescuentoCliente(userId)
                descuentoCliente = descResult.getOrNull() ?: 0.0
            }

            isLoading = false
        }
    }

    LaunchedEffect(anchoSeleccionado, fondoSeleccionado, colorSeleccionado, accesoriosSeleccionados) {
        if (anchoSeleccionado != null && fondoSeleccionado != null && colorSeleccionado != null) {
            // Calcular área
            areaM2 = PergolasPricing.calcAreaM2(anchoSeleccionado!!, fondoSeleccionado!!)

            // TODO: Obtener precio desde Supabase usando fetchPrecioPergola
            // Por ahora usar precio estimado de 220€/m2 (como en el ejemplo de la web)
            val precioM2 = 220.0
            precioBase = precioM2 * areaM2

            // Calcular incremento por color (área × incremento_eur_m2)
            val incrementoM2 = colorSeleccionado!!.incrementoEurM2.toDouble()
            incrementoColor = if (incrementoM2 > 0) {
                areaM2 * incrementoM2
            } else {
                0.0
            }

            totalAccesorios = PergolasPricing.calcAccesoriosTotal(accesoriosSeleccionados)
            subtotal = precioBase + incrementoColor + totalAccesorios
            total = PergolasPricing.applyDiscount(subtotal, descuentoCliente)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Pérgola Bioclimática",
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
                    "Medidas",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                // Ancho
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
                        // Obtener anchos únicos de las medidas (manejar nullable)
                        catalogo!!.medidas?.map { it.anchoMm }?.distinct()?.sorted()?.forEach { ancho ->
                            DropdownMenuItem(
                                text = { Text("$ancho mm") },
                                onClick = {
                                    anchoSeleccionado = ancho
                                    fondoSeleccionado = null
                                    expandedAncho = false
                                }
                            )
                        }
                    }
                }

                // Fondo
                if (anchoSeleccionado != null) {
                    // Obtener fondos disponibles para el ancho seleccionado (manejar nullable)
                    val fondosDisponibles = catalogo!!.medidas
                        ?.filter { it.anchoMm == anchoSeleccionado }
                        ?.map { it.fondoMm }
                        ?.distinct()
                        ?.sorted()
                        ?: emptyList()

                    var expandedFondo by remember { mutableStateOf(false) }
                    ExposedDropdownMenuBox(
                        expanded = expandedFondo,
                        onExpandedChange = { expandedFondo = it }
                    ) {
                        OutlinedTextField(
                            value = fondoSeleccionado?.let { "$it mm" } ?: "",
                            onValueChange = {},
                            readOnly = true,
                            label = { Text("Fondo") },
                            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expandedFondo) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .menuAnchor(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFFFF6600),
                                focusedLabelColor = Color(0xFFFF6600)
                            )
                        )

                        ExposedDropdownMenu(
                            expanded = expandedFondo,
                            onDismissRequest = { expandedFondo = false }
                        ) {
                            fondosDisponibles.forEach { fondo ->
                                DropdownMenuItem(
                                    text = { Text("$fondo mm") },
                                    onClick = {
                                        fondoSeleccionado = fondo
                                        expandedFondo = false
                                    }
                                )
                            }
                        }
                    }
                }

                // Color
                if (fondoSeleccionado != null) {
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
                                val incremento = areaM2 * color.incrementoEurM2.toDouble()
                                DropdownMenuItem(
                                    text = {
                                        Text("${color.nombre} (+${String.format(Locale.US, "%.2f", incremento)}€)")
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

                // Resumen
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
                                Text("Área:")
                                Text("${String.format(Locale.US, "%.2f", areaM2)} m²")
                            }

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

