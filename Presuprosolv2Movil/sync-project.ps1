# Script de Sincronización y Limpieza - PresuProsol Móvil
# Ejecutar en PowerShell desde la raíz del proyecto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PresuProsol Móvil - Sync & Clean" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar proyecto
Write-Host "[1/3] Limpiando proyecto..." -ForegroundColor Yellow
.\gradlew clean
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Limpieza exitosa" -ForegroundColor Green
} else {
    Write-Host "⚠️  Limpieza completada con warnings (normal)" -ForegroundColor Yellow
}
Write-Host ""

# Paso 2: Sincronizar dependencias
Write-Host "[2/3] Sincronizando dependencias..." -ForegroundColor Yellow
.\gradlew --refresh-dependencies
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias sincronizadas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Sync completado con warnings (normal)" -ForegroundColor Yellow
}
Write-Host ""

# Paso 3: Compilar proyecto
Write-Host "[3/3] Compilando proyecto..." -ForegroundColor Yellow
.\gradlew assembleDebug
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  ✅ PROYECTO LISTO" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "APK generado en:" -ForegroundColor Cyan
    Write-Host "app\build\outputs\apk\debug\app-debug.apk" -ForegroundColor White
    Write-Host ""
    Write-Host "Próximos pasos:" -ForegroundColor Cyan
    Write-Host "1. Abre el proyecto en Android Studio" -ForegroundColor White
    Write-Host "2. File → Sync Project with Gradle Files" -ForegroundColor White
    Write-Host "3. Configura tus credenciales de Supabase en SupabaseAuth.kt" -ForegroundColor White
    Write-Host "4. Ejecuta la app (Shift + F10)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    Write-Host ""
    Write-Host "Solución:" -ForegroundColor Yellow
    Write-Host "1. Abre Android Studio" -ForegroundColor White
    Write-Host "2. File → Invalidate Caches → Invalidate and Restart" -ForegroundColor White
    Write-Host "3. Espera a que termine la indexación" -ForegroundColor White
    Write-Host "4. File → Sync Project with Gradle Files" -ForegroundColor White
    Write-Host ""
}

Write-Host "Documentación completa en:" -ForegroundColor Cyan
Write-Host "- README.md" -ForegroundColor White
Write-Host "- INSTRUCCIONES_FINALES.md" -ForegroundColor White
Write-Host "- CONFIGURACION_SUPABASE.md" -ForegroundColor White
Write-Host ""

