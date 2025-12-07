package com.example.presuprosolv2movil.ui.screens

import android.content.ContentValues
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.presuprosolv2movil.data.AuthManager
import com.example.presuprosolv2movil.data.models.Presupuesto
import com.example.presuprosolv2movil.data.repositories.GeneralRepository
import kotlinx.coroutines.launch
import java.io.OutputStream
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MisPresupuestosScreen(navController: NavController) {
    val context = LocalContext.current
    var presupuestos by remember { mutableStateOf<List<Presupuesto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    var filtroTipo by remember { mutableStateOf("todos") }
    var filtroPrecio by remember { mutableStateOf("todos") }
    var ordenamiento by remember { mutableStateOf("fecha-desc") }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var presupuestoToDelete by remember { mutableStateOf<Presupuesto?>(null) }
    val scope = rememberCoroutineScope()

    // Función para recargar presupuestos
    fun reloadPresupuestos() {
        scope.launch {
            isLoading = true
            val userId = AuthManager.getCurrentUserId()
            if (!userId.isNullOrEmpty()) {
                presupuestos = GeneralRepository.fetchPresupuestosUsuario(userId)
            }
            isLoading = false
        }
    }

    // Cargar presupuestos al iniciar
    LaunchedEffect(Unit) {
        reloadPresupuestos()
    }

    // Filtrar y ordenar presupuestos
    val presupuestosFiltrados = remember(presupuestos, filtroTipo, filtroPrecio, ordenamiento) {
        presupuestos
            .filter { p ->
                // Filtro de tipo
                val matchTipo = filtroTipo == "todos" || p.tipo == filtroTipo

                // Filtro de precio
                val matchPrecio = when (filtroPrecio) {
                    "0-500" -> p.total in 0.0..500.0
                    "500-1000" -> p.total in 500.01..1000.0
                    "1000-2500" -> p.total in 1000.01..2500.0
                    "2500+" -> p.total > 2500.0
                    else -> true
                }

                matchTipo && matchPrecio
            }
            .sortedWith(
                when (ordenamiento) {
                    "fecha-desc" -> compareByDescending { it.createdAt }
                    "fecha-asc" -> compareBy { it.createdAt }
                    "precio-desc" -> compareByDescending { it.total }
                    "precio-asc" -> compareBy { it.total }
                    else -> compareByDescending { it.createdAt }
                }
            )
    }

    // Obtener tipos únicos para el filtro
    val tiposUnicos = remember(presupuestos) {
        presupuestos.map { it.tipo }.distinct().sorted()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "📋 Mis Presupuestos",
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Volver")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2D2A6E),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
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
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFFFF6600))
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Cargando presupuestos...")
                }
            }
        } else if (presupuestos.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(32.dp)
                ) {
                    Icon(
                        Icons.Default.Info,
                        contentDescription = null,
                        modifier = Modifier.size(80.dp),
                        tint = Color(0xFFBDBDBD)
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        "No tienes presupuestos aún",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF757575)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "¡Crea tu primer presupuesto!",
                        fontSize = 14.sp,
                        color = Color(0xFF9E9E9E)
                    )
                }
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
            ) {
                // Filtros
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFF5F5F5)
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        // Fila 1: Filtros
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Filtro por tipo
                            FilterDropdown(
                                label = "Tipo",
                                value = filtroTipo,
                                options = listOf("todos" to "Todos los tipos") + tiposUnicos.map { it to getNombreCategoria(it) },
                                onValueChange = { filtroTipo = it },
                                modifier = Modifier.weight(1f)
                            )

                            // Filtro por precio
                            FilterDropdown(
                                label = "Precio",
                                value = filtroPrecio,
                                options = listOf(
                                    "todos" to "Todos",
                                    "0-500" to "0€ - 500€",
                                    "500-1000" to "500€ - 1000€",
                                    "1000-2500" to "1000€ - 2500€",
                                    "2500+" to "2500€+"
                                ),
                                onValueChange = { filtroPrecio = it },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Fila 2: Ordenamiento y contador
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            FilterDropdown(
                                label = "Ordenar",
                                value = ordenamiento,
                                options = listOf(
                                    "fecha-desc" to "Más recientes",
                                    "fecha-asc" to "Más antiguos",
                                    "precio-desc" to "Precio mayor",
                                    "precio-asc" to "Precio menor"
                                ),
                                onValueChange = { ordenamiento = it },
                                modifier = Modifier.weight(1f)
                            )

                            Spacer(modifier = Modifier.width(16.dp))

                            Text(
                                "Mostrando ${presupuestosFiltrados.size} de ${presupuestos.size}",
                                fontSize = 12.sp,
                                color = Color(0xFF757575),
                                modifier = Modifier.padding(end = 8.dp)
                            )
                        }
                    }
                }

                // Lista de presupuestos
                if (presupuestosFiltrados.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "No se encontraron presupuestos con los filtros aplicados",
                            fontSize = 16.sp,
                            color = Color(0xFF757575)
                        )
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(presupuestosFiltrados) { presupuesto ->
                            PresupuestoItem(
                                presupuesto = presupuesto,
                                context = context,
                                onPay = {
                                    scope.launch {
                                        try {
                                            val userId = AuthManager.getCurrentUserId()
                                            if (!userId.isNullOrEmpty()) {
                                                val success = GeneralRepository.pagarPresupuesto(presupuesto.id, userId)
                                                if (success) {
                                                    Toast.makeText(context, "Pedido creado exitosamente", Toast.LENGTH_SHORT).show()
                                                    reloadPresupuestos()
                                                } else {
                                                    Toast.makeText(context, "Error al procesar el pago", Toast.LENGTH_SHORT).show()
                                                }
                                            }
                                        } catch (e: Exception) {
                                            Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                },
                                onDelete = {
                                    presupuestoToDelete = presupuesto
                                    showDeleteDialog = true
                                }
                            )
                        }
                    }
                }
            }
        }
    }

    // Diálogo de confirmación para eliminar
    if (showDeleteDialog && presupuestoToDelete != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("Eliminar Presupuesto") },
            text = {
                Column {
                    Text("¿Estás seguro de que quieres eliminar este presupuesto?")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Cliente: ${presupuestoToDelete?.cliente ?: "Sin nombre"}",
                        fontWeight = FontWeight.Bold
                    )
                    Text("Total: ${String.format(Locale.US, "%.2f", presupuestoToDelete?.total ?: 0.0)} €")
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        "Esta acción no se puede deshacer",
                        color = Color(0xFFF44336),
                        fontSize = 12.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        scope.launch {
                            try {
                                val success = GeneralRepository.eliminarPresupuesto(presupuestoToDelete!!.id)
                                if (success) {
                                    Toast.makeText(context, "Presupuesto eliminado", Toast.LENGTH_SHORT).show()
                                    reloadPresupuestos()
                                } else {
                                    Toast.makeText(context, "Error al eliminar", Toast.LENGTH_SHORT).show()
                                }
                            } catch (e: Exception) {
                                Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                            }
                            showDeleteDialog = false
                            presupuestoToDelete = null
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF44336))
                ) {
                    Text("Eliminar")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showDeleteDialog = false
                    presupuestoToDelete = null
                }) {
                    Text("Cancelar")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FilterDropdown(
    label: String,
    value: String,
    options: List<Pair<String, String>>,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var expanded by remember { mutableStateOf(false) }

    ExposedDropdownMenuBox(
        expanded = expanded,
        onExpandedChange = { expanded = it },
        modifier = modifier
    ) {
        OutlinedTextField(
            value = options.find { it.first == value }?.second ?: label,
            onValueChange = {},
            readOnly = true,
            label = { Text(label, fontSize = 12.sp) },
            trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded) },
            modifier = Modifier
                .fillMaxWidth()
                .menuAnchor(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFFFF6600),
                focusedLabelColor = Color(0xFFFF6600)
            ),
            textStyle = LocalTextStyle.current.copy(fontSize = 14.sp)
        )

        ExposedDropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option.second, fontSize = 14.sp) },
                    onClick = {
                        onValueChange(option.first)
                        expanded = false
                    }
                )
            }
        }
    }
}

@Composable
fun PresupuestoItem(
    presupuesto: Presupuesto,
    context: Context,
    onPay: () -> Unit,
    onDelete: () -> Unit
) {
    var generatingPdf by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header: Fecha y Tipo
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = formatFecha(presupuesto.createdAt),
                        fontSize = 12.sp,
                        color = Color(0xFF757575)
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = getNombreCategoria(presupuesto.tipo),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF2D2A6E)
                    )
                }
                EstadoChip(presupuesto)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Cliente
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Color(0xFF757575)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = presupuesto.cliente?.takeIf { it.isNotEmpty() } ?: "Sin nombre",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium
                    )
                    if (!presupuesto.email.isNullOrEmpty()) {
                        Text(
                            text = presupuesto.email!!,
                            fontSize = 12.sp,
                            color = Color(0xFF757575)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Detalles
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFFF5F5F5)
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text(
                        "Detalles",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF757575)
                    )
                    Spacer(modifier = Modifier.height(8.dp))

                    // Medidas
                    if (presupuesto.tipo.contains("pergola") && presupuesto.anchoMm > 0 && presupuesto.fondo_mm > 0) {
                        DetailRow("Medidas", "${presupuesto.anchoMm} × ${presupuesto.fondo_mm} mm")
                    } else if (presupuesto.altoMm > 0 && presupuesto.anchoMm > 0) {
                        DetailRow("Medidas", "${presupuesto.altoMm} × ${presupuesto.anchoMm} mm")
                    }

                    // Modelo
                    if (!presupuesto.modelo.isNullOrEmpty()) {
                        DetailRow("Modelo", presupuesto.modelo!!)
                    }

                    // Acabado
                    if (!presupuesto.acabado.isNullOrEmpty()) {
                        DetailRow("Acabado", presupuesto.acabado!!)
                    }

                    // Color
                    if (!presupuesto.color.isNullOrEmpty()) {
                        DetailRow("Color", presupuesto.color!!)
                    }

                    // Accesorios
                    if (presupuesto.accesorios.isNotEmpty()) {
                        DetailRow("Accesorios", "${presupuesto.accesorios.size} accesorio${if (presupuesto.accesorios.size != 1) "s" else ""}")
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            HorizontalDivider()

            Spacer(modifier = Modifier.height(12.dp))

            // Total y Acciones
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "TOTAL",
                        fontSize = 12.sp,
                        color = Color(0xFF757575),
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "${String.format(Locale.US, "%.2f", presupuesto.total)} €",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFF6600)
                    )
                }

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (presupuesto.pagado) {
                        FilledTonalButton(
                            onClick = {
                                if (!generatingPdf) {
                                    generatingPdf = true
                                    generatePresupuestoPdf(context, presupuesto) {
                                        generatingPdf = false
                                    }
                                }
                            },
                            enabled = !generatingPdf,
                            colors = ButtonDefaults.filledTonalButtonColors(
                                containerColor = Color(0xFF4CAF50).copy(alpha = 0.1f),
                                contentColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Icon(Icons.Default.Settings, null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(if (generatingPdf) "Generando..." else "PDF", fontSize = 12.sp)
                        }
                    } else if (presupuesto.invalidado) {
                        OutlinedButton(
                            onClick = onDelete,
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color(0xFFF44336)
                            )
                        ) {
                            Icon(Icons.Default.Delete, null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Eliminar", fontSize = 12.sp)
                        }
                    } else {
                        // QUITADO: Botón de Editar
                        Button(
                            onClick = onPay,
                            enabled = !presupuesto.precioDesactualizado,
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Text("Pagar", fontSize = 12.sp)
                        }
                        IconButton(
                            onClick = onDelete,
                            modifier = Modifier.size(36.dp)
                        ) {
                            Icon(Icons.Default.Delete, null, tint = Color(0xFFF44336))
                        }
                    }
                }
            }

            // Alertas
            if (presupuesto.invalidado) {
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFFFF3CD)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color(0xFFFFA000),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            presupuesto.razonInvalidacion?.takeIf { it.isNotEmpty() } ?: "Producto eliminado del catálogo",
                            fontSize = 12.sp,
                            color = Color(0xFF856404)
                        )
                    }
                }
            } else if (presupuesto.precioDesactualizado) {
                Spacer(modifier = Modifier.height(12.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFFFFF3CD)
                    )
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Default.Warning,
                            contentDescription = null,
                            tint = Color(0xFFFFA000),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Precios desactualizados. Edita para actualizar.",
                            fontSize = 12.sp,
                            color = Color(0xFF856404)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EstadoChip(presupuesto: Presupuesto) {
    val (text, bgColor, textColor) = when {
        presupuesto.pagado -> Triple("Pagado", Color(0xFF2196F3), Color.White)
        else -> Triple("Pendiente", Color(0xFFFFA000), Color.White)
    }

    Surface(
        shape = RoundedCornerShape(16.dp),
        color = bgColor
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = textColor
        )
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            color = Color(0xFF757575)
        )
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
    Spacer(modifier = Modifier.height(4.dp))
}

fun formatFecha(fecha: String): String {
    return try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val date = sdf.parse(fecha.split("T")[0])
        SimpleDateFormat("d/M/yyyy", Locale.getDefault()).format(date ?: Date())
    } catch (_: Exception) {
        fecha.split("T")[0]
    }
}

fun getNombreCategoria(tipo: String): String {
    return when (tipo) {
        "mosquitera-corredera" -> "Mosquiteras Correderas"
        "mosquitera-enrollable" -> "Mosquiteras Enrollables"
        "mosquitera-fija" -> "Mosquiteras Fijas"
        "mosquitera-plisada" -> "Mosquiteras Plisadas"
        "pano-enrollable" -> "Paños Enrollables"
        "pano-plisado" -> "Paños Plisados"
        "compacto-cajonfrontal" -> "Compactos Cajón Frontal"
        "compacto-minimo" -> "Compactos Mínimo"
        "compacto-monoblock" -> "Compactos Monoblock"
        "proteccion-solar-enrollable" -> "Protección Solar Enrollable"
        "proteccion-solar-lateral" -> "Protección Solar Lateral"
        "proteccion-solar-ventuszip01" -> "Protección Solar Ventus"
        "puerta-seccional-residencial" -> "Puertas Seccionales Residencial"
        "puerta-seccional-industrial" -> "Puertas Seccionales Industrial"
        "pergola-bioclimatica" -> "Pérgolas Bioclimáticas"
        else -> tipo
    }
}

/** Genera un PDF del presupuesto y lo guarda en Descargas */
private fun generatePresupuestoPdf(context: Context, presupuesto: Presupuesto, onFinished: () -> Unit) {
    try {
        val doc = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = doc.startPage(pageInfo)
        val canvas: Canvas = page.canvas

        val titlePaint = Paint().apply {
            color = android.graphics.Color.parseColor("#2D2A6E")
            textSize = 20f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }

        val headerPaint = Paint().apply {
            color = android.graphics.Color.parseColor("#FF6600")
            textSize = 14f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }

        val normalPaint = Paint().apply {
            color = android.graphics.Color.BLACK
            textSize = 12f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        }

        val boldPaint = Paint().apply {
            color = android.graphics.Color.BLACK
            textSize = 12f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.BOLD)
        }

        var y = 50f

        fun drawText(text: String, paint: Paint) {
            canvas.drawText(text, 40f, y, paint)
            y += paint.textSize + 8f
        }

        // Título
        drawText("PRESUPUESTO", titlePaint)
        drawText("PresuProsol - Soluciones Profesionales", normalPaint)
        y += 10f

        // Información del cliente
        drawText("INFORMACIÓN DEL CLIENTE", headerPaint)
        drawText("Cliente: ${presupuesto.cliente ?: "N/A"}", normalPaint)
        drawText("Email: ${presupuesto.email ?: "N/A"}", normalPaint)
        drawText("CIF: ${presupuesto.cif ?: "N/A"}", normalPaint)
        drawText("Fecha: ${formatFecha(presupuesto.createdAt)}", normalPaint)
        drawText("Tipo: ${getNombreCategoria(presupuesto.tipo)}", normalPaint)
        y += 10f

        // Detalles del producto
        drawText("DETALLES DEL PRODUCTO", headerPaint)

        if (presupuesto.tipo.contains("pergola") && presupuesto.fondo_mm > 0) {
            drawText("Medidas: ${presupuesto.anchoMm} × ${presupuesto.fondo_mm} mm", normalPaint)
        } else if (presupuesto.altoMm > 0 && presupuesto.anchoMm > 0) {
            drawText("Medidas: ${presupuesto.altoMm} × ${presupuesto.anchoMm} mm", normalPaint)
        }

        if (!presupuesto.modelo.isNullOrEmpty()) {
            drawText("Modelo: ${presupuesto.modelo}", normalPaint)
        }

        if (!presupuesto.acabado.isNullOrEmpty()) {
            drawText("Acabado: ${presupuesto.acabado}", normalPaint)
        }

        if (!presupuesto.color.isNullOrEmpty()) {
            drawText("Color: ${presupuesto.color}", normalPaint)
        }

        if (presupuesto.medidaPrecio > 0) {
            drawText("Precio base: ${String.format(Locale.US, "%.2f", presupuesto.medidaPrecio)} €", normalPaint)
        }

        y += 10f

        // Accesorios
        if (presupuesto.accesorios.isNotEmpty()) {
            drawText("ACCESORIOS", headerPaint)
            presupuesto.accesorios.forEach { acc ->
                val total = acc.unidades * acc.precioUnit
                drawText("${acc.nombre} - ${acc.unidades} ud × ${String.format(Locale.US, "%.2f", acc.precioUnit)}€ = ${String.format(Locale.US, "%.2f", total)}€", normalPaint)
            }
            y += 10f
        }

        // Resumen financiero
        drawText("RESUMEN FINANCIERO", headerPaint)
        drawText("Subtotal: ${String.format(Locale.US, "%.2f", presupuesto.subtotal)} €", normalPaint)

        if (presupuesto.descuentoCliente > 0) {
            val descuentoMonto = presupuesto.subtotal * (presupuesto.descuentoCliente / 100.0)
            drawText("Descuento (${presupuesto.descuentoCliente}%): -${String.format(Locale.US, "%.2f", descuentoMonto)} €", normalPaint)
        }

        y += 5f
        drawText("TOTAL: ${String.format(Locale.US, "%.2f", presupuesto.total)} €", boldPaint)

        y += 5f
        drawText("Estado: ${if (presupuesto.pagado) "✓ PAGADO" else "Pendiente de pago"}", normalPaint)

        doc.finishPage(page)

        // Guardar el PDF
        val filename = "presupuesto-${presupuesto.cliente?.replace(" ", "-") ?: presupuesto.id.substring(0, 8)}.pdf"
        var outStream: OutputStream? = null

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val resolver = context.contentResolver
            val contentValues = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, filename)
                put(MediaStore.Downloads.MIME_TYPE, "application/pdf")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
            uri?.let {
                outStream = resolver.openOutputStream(it)
                outStream?.use { doc.writeTo(it) }
                contentValues.clear()
                contentValues.put(MediaStore.Downloads.IS_PENDING, 0)
                resolver.update(it, contentValues, null, null)
                Toast.makeText(context, "PDF guardado en Descargas", Toast.LENGTH_SHORT).show()
            }
        } else {
            @Suppress("DEPRECATION")
            val downloads = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
            val file = java.io.File(downloads, filename)
            outStream = java.io.FileOutputStream(file)
            outStream.use { doc.writeTo(it) }
            Toast.makeText(context, "PDF guardado en: ${file.absolutePath}", Toast.LENGTH_SHORT).show()
        }

        doc.close()
    } catch (e: Exception) {
        e.printStackTrace()
        Toast.makeText(context, "Error al generar PDF: ${e.message}", Toast.LENGTH_SHORT).show()
    } finally {
        onFinished()
    }
}

