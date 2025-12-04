// src/pages/admin/productos.js
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/Header";
import styles from "../../styles/Admin.module.css";
import { supabase } from "../../lib/supabaseClient";

const CATEGORIAS = [
  {
    id: "compactos",
    nombre: "Compactos",
    tablas: [
      { nombre: "compactos_modelos", display: "Modelos", tieneImagen: false },
      { nombre: "compactos_acabados", display: "Acabados", tieneImagen: false },
      { nombre: "compactos_guias_precios", display: "Precios Guías", tieneImagen: false },
    ],
  },
  {
    id: "mosquiteras",
    nombre: "Mosquiteras",
    tablas: [
      { nombre: "mosq_medidas", display: "Medidas", tieneImagen: false, tieneTipo: true },
      { nombre: "mosq_colores", display: "Colores", tieneImagen: false },
    ],
  },
  {
    id: "panos",
    nombre: "Paños",
    tablas: [
      { nombre: "panos_modelos", display: "Modelos", tieneImagen: false },
      { nombre: "panos_acabados", display: "Acabados", tieneImagen: false },
      { nombre: "panos_precios", display: "Precios", tieneImagen: false },
    ],
  },
  {
    id: "pergolas",
    nombre: "Pérgolas",
    tablas: [
      { nombre: "pergolas_medidas", display: "Medidas", tieneImagen: false },
      { nombre: "pergolas_colores", display: "Colores", tieneImagen: false },
      { nombre: "pergolas_precios", display: "Precios", tieneImagen: false },
    ],
  },
  {
    id: "proteccion-solar",
    nombre: "Protección Solar",
    tablas: [
      { nombre: "proteccionsolar_modelos", display: "Modelos", tieneImagen: false },
      { nombre: "proteccionsolar_colores_estructura", display: "Colores", tieneImagen: false },
      { nombre: "proteccionsolar_precios", display: "Precios", tieneImagen: false },
    ],
  },
  {
    id: "puertas",
    nombre: "Puertas Seccionales",
    tablas: [
      { nombre: "puertas_medidas", display: "Medidas", tieneImagen: false },
      { nombre: "puertas_colores", display: "Colores", tieneImagen: false },
      { nombre: "puertas_precios", display: "Precios", tieneImagen: false },
    ],
  },
];

export default function AdminProductos() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [tablaSeleccionada, setTablaSeleccionada] = useState(null);
  const [datos, setDatos] = useState([]);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [mostrarModalEditar, setMostrarModalEditar] = useState(false);
  const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [formData, setFormData] = useState({});
  const [columnas, setColumnas] = useState([]);
  const [filtroTexto, setFiltroTexto] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [tipoAlerta, setTipoAlerta] = useState("success");
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);
  const [itemEliminar, setItemEliminar] = useState(null);
  const [categoriasExpandidas, setCategoriasExpandidas] = useState({});
  
  // Estados para datos relacionados (selectores en tablas de precios)
  const [datosRelacionados, setDatosRelacionados] = useState({
    modelos: [],
    acabados: [],
    medidas: [],
    colores: []
  });

  // Función para toggle categorías
  const toggleCategoria = (categoriaId) => {
    setCategoriasExpandidas(prev => ({
      ...prev,
      [categoriaId]: !prev[categoriaId]
    }));
  };

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login?m=login-required");
    }
  }, [loading, session, router]);

  // Filtrar datos cuando cambia el texto de búsqueda
  useEffect(() => {
    if (!filtroTexto.trim()) {
      setDatosFiltrados(datos);
      return;
    }

    const textoLower = filtroTexto.toLowerCase();
    const filtrados = datos.filter((item) => {
      return Object.values(item).some((valor) => {
        if (valor === null || valor === undefined) return false;
        return String(valor).toLowerCase().includes(textoLower);
      });
    });
    setDatosFiltrados(filtrados);
  }, [filtroTexto, datos]);

  function mostrarAlertaPersonalizada(mensaje, tipo = "success") {
    setMensajeAlerta(mensaje);
    setTipoAlerta(tipo);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 4000);
  }

  async function cargarDatos(nombreTabla) {
    setLoadingData(true);
    setFiltroTexto("");
    try {
      const { data, error } = await supabase.from(nombreTabla).select("*").order("id");
      
      if (error) throw error;
      
      setDatos(data || []);
      setDatosFiltrados(data || []);
      
      if (data && data.length > 0) {
        const cols = Object.keys(data[0]).filter(
          (col) => col !== "id" && col !== "created_at" && col !== "updated_at" && col !== "imagen"
        );
        setColumnas(cols);
      } else {
        const cols = await obtenerColumnasTabla(nombreTabla);
        setColumnas(cols);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
      mostrarAlertaPersonalizada("❌ Error al cargar los datos", "error");
    } finally {
      setLoadingData(false);
    }
  }

  async function obtenerColumnasTabla(nombreTabla) {
    const columnasMap = {
      compactos_modelos: ["nombre", "tipo", "activo"],
      compactos_acabados: ["nombre", "clave", "orden", "activo"],
      compactos_accesorios: ["nombre", "unidad", "pvp", "activo"],
      compactos_guias_precios: ["modelo_id", "acabado_id", "precio_ml"],
      mosq_medidas: ["tipo", "alto_mm", "ancho_mm", "precio"],
      mosq_colores: ["nombre", "precio_ml", "hex", "activo"],
      mosq_accesorios: ["nombre", "unidad", "perimetral", "precio", "activo"],
      panos_modelos: ["tipo", "nombre", "activo"],
      panos_acabados: ["clave", "nombre", "orden", "activo"],
      panos_accesorios: ["nombre", "unidad", "pvp", "activo"],
      panos_precios: ["modelo_id", "acabado_id", "precio_m2"],
      pergolas_medidas: ["ancho_mm", "fondo_mm", "activo"],
      pergolas_colores: ["nombre", "incremento_eur_m2", "hex", "activo"],
      pergolas_accesorios: ["nombre", "unidad", "precio", "activo"],
      pergolas_precios: ["ancho_mm", "fondo_mm", "color_id", "precio_m2"],
      proteccionsolar_modelos: ["nombre", "tipo", "activo"],
      proteccionsolar_colores: ["nombre", "precio_adicional", "hex", "activo"],
      proteccionsolar_accesorios: ["nombre", "unidad", "precio", "activo"],
      proteccionsolar_precios: ["modelo_id", "color_id", "precio_m2"],
      puertas_medidas: ["ancho_mm", "alto_mm", "activo"],
      puertas_colores: ["nombre", "incremento", "hex", "activo"],
      puertas_accesorios: ["nombre", "unidad", "precio", "activo"],
      puertas_precios: ["ancho_mm", "alto_mm", "color_id", "precio"],
    };

    return columnasMap[nombreTabla] || [];
  }

  async function seleccionarTabla(categoria, tabla) {
    setCategoriaSeleccionada(categoria);
    setTablaSeleccionada(tabla);
    await cargarDatos(tabla.nombre);
    
    // Si es tabla de precios, cargar datos relacionados
    if (tabla.nombre.includes("_precios") || tabla.nombre.includes("_guias_precios")) {
      await cargarDatosRelacionados(tabla.nombre);
    }
  }

  async function cargarDatosRelacionados(nombreTabla) {
    try {
      const categoria = nombreTabla.split("_")[0];
      const relacionados = {};

      // Compactos: modelos y acabados
      if (nombreTabla === "compactos_guias_precios") {
        const { data: modelos } = await supabase
          .from("compactos_modelos")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");
        
        const { data: acabados } = await supabase
          .from("compactos_acabados")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");

        relacionados.modelos = modelos || [];
        relacionados.acabados = acabados || [];
      }

      // Paños: modelos y acabados
      if (nombreTabla === "panos_precios") {
        const { data: modelos } = await supabase
          .from("panos_modelos")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");
        
        const { data: acabados } = await supabase
          .from("panos_acabados")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");

        relacionados.modelos = modelos || [];
        relacionados.acabados = acabados || [];
      }

      // Pérgolas: medidas, colores
      if (nombreTabla === "pergolas_precios") {
        const { data: medidas } = await supabase
          .from("pergolas_medidas")
          .select("id, ancho_mm, fondo_mm")
          .eq("activo", true)
          .order("ancho_mm");
        
        const { data: colores } = await supabase
          .from("pergolas_colores")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");

        relacionados.medidas = medidas || [];
        relacionados.colores = colores || [];
      }

      // Protección Solar: modelos y colores
      if (nombreTabla === "proteccionsolar_precios") {
        const { data: modelos } = await supabase
          .from("proteccionsolar_modelos")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");
        
        const { data: colores } = await supabase
          .from("proteccionsolar_colores_estructura")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");

        relacionados.modelos = modelos || [];
        relacionados.colores = colores || [];
      }

      // Puertas: medidas, colores
      if (nombreTabla === "puertas_precios") {
        const { data: medidas } = await supabase
          .from("puertas_medidas")
          .select("id, ancho_mm, alto_mm")
          .eq("activo", true)
          .order("ancho_mm");
        
        const { data: colores } = await supabase
          .from("puertas_colores")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre");

        relacionados.medidas = medidas || [];
        relacionados.colores = colores || [];
      }

      setDatosRelacionados(relacionados);
      
    } catch (error) {
      console.error("Error cargando datos relacionados:", error);
    }
  }

  async function abrirModalNuevo() {
    const initialData = {};
    
    // Obtener el último orden si existe
    if (columnas.includes("orden")) {
      const maxOrden = datos.length > 0 
        ? Math.max(...datos.map(item => item.orden || 0))
        : 0;
      initialData.orden = maxOrden + 1;
    }
    
    columnas.forEach((col) => {
      if (col === "orden" && initialData.orden) return; // Ya se estableció
      if (col === "activo") initialData[col] = true;
      else if (col === "perimetral") initialData[col] = false;
      else if (col.includes("precio") || col.includes("pvp") || col.includes("incremento")) {
        initialData[col] = 0;
      } else if (col.includes("_mm") || col.includes("_m2") || col.includes("_ml")) {
        initialData[col] = 0;
      } else if (col === "precio_base") {
        initialData[col] = 0;
      } else if (col.includes("_id")) {
        initialData[col] = null;
      } else {
        initialData[col] = "";
      }
    });
    setFormData(initialData);
    setMostrarModalNuevo(true);
  }

  function abrirModalEditar(item) {
    setItemEditar(item);
    const data = {};
    columnas.forEach((col) => {
      data[col] = item[col] ?? "";
    });
    setFormData(data);
    setMostrarModalEditar(true);
  }

  function cerrarModales() {
    setMostrarModalNuevo(false);
    setMostrarModalEditar(false);
    setItemEditar(null);
    setFormData({});
  }

  async function guardarNuevo() {
    try {
      // Validar que los campos obligatorios no estén vacíos
      const camposVacios = columnas.filter(col => {
        const valor = formData[col];
        // Permitir 0 en campos numéricos, pero no vacíos en texto
        if (col.includes("_id")) return false; // Los IDs pueden ser null
        if (col === "activo" || col === "perimetral") return false; // Booleanos siempre tienen valor
        if (col.includes("precio") || col.includes("pvp") || col.includes("incremento")) {
          return valor === null || valor === undefined || valor === "";
        }
        if (col.includes("_mm") || col.includes("_m2") || col.includes("_ml") || col === "orden") {
          return valor === null || valor === undefined || valor === "";
        }
        return !valor || valor.toString().trim() === "";
      });

      if (camposVacios.length > 0) {
        mostrarAlertaPersonalizada(`⚠️ Por favor completa los campos: ${camposVacios.join(", ")}`, "warning");
        return;
      }

      // Para tablas de precios, validar que el precio sea mayor a 0
      const esTablaPrecios = tablaSeleccionada.nombre.includes("_precios");
      if (esTablaPrecios) {
        const campoPrecio = columnas.find(col => col === "precio" || col === "precio_ml" || col === "precio_m2");
        if (campoPrecio) {
          const valorPrecio = parseFloat(formData[campoPrecio]);
          if (!valorPrecio || valorPrecio <= 0) {
            mostrarAlertaPersonalizada(`⚠️ El precio debe ser mayor a 0`, "warning");
            return;
          }
        }

        // Validar combinaciones completas según el tipo de tabla
        if (tablaSeleccionada.nombre === "compactos_guias_precios" || tablaSeleccionada.nombre === "panos_precios") {
          if (!formData.modelo_id || !formData.acabado_id) {
            mostrarAlertaPersonalizada(`⚠️ Debes seleccionar tanto el modelo como el acabado`, "warning");
            return;
          }
        }

        if (tablaSeleccionada.nombre === "pergolas_precios") {
          if (!formData.ancho_mm || !formData.fondo_mm || !formData.color_id) {
            mostrarAlertaPersonalizada(`⚠️ Debes seleccionar ancho, fondo y color`, "warning");
            return;
          }
        }

        if (tablaSeleccionada.nombre === "puertas_precios") {
          if (!formData.ancho_mm || !formData.alto_mm || !formData.color_id) {
            mostrarAlertaPersonalizada(`⚠️ Debes seleccionar ancho, alto y color`, "warning");
            return;
          }
        }

        if (tablaSeleccionada.nombre === "proteccionsolar_precios") {
          if (!formData.modelo_id || !formData.color_id) {
            mostrarAlertaPersonalizada(`⚠️ Debes seleccionar tanto el modelo como el color`, "warning");
            return;
          }
        }
      }

      // Asegurar que precios tengan valor 0 por defecto (solo para tablas NO de precios)
      const dataToInsert = { ...formData };
      if (!esTablaPrecios) {
        columnas.forEach(col => {
          if ((col.includes("precio") || col.includes("pvp") || col.includes("incremento") || col === "precio_base") 
              && (dataToInsert[col] === null || dataToInsert[col] === undefined || dataToInsert[col] === "")) {
            dataToInsert[col] = 0;
          }
        });
      }

      // Asegurar que perimetral sea false si no está definido
      if (columnas.includes("perimetral") && (dataToInsert.perimetral === null || dataToInsert.perimetral === undefined)) {
        dataToInsert.perimetral = false;
      }

      const { data, error } = await supabase
        .from(tablaSeleccionada.nombre)
        .insert([dataToInsert])
        .select();

      if (error) throw error;

      mostrarAlertaPersonalizada(`✅ ${tablaSeleccionada.display} creado correctamente`, "success");
      cerrarModales();
      cargarDatos(tablaSeleccionada.nombre);
    } catch (error) {
      console.error("Error creando:", error);
      mostrarAlertaPersonalizada(`❌ Error al crear: ${error.message}`, "error");
    }
  }

  async function guardarEdicion() {
    try {
      const { error } = await supabase
        .from(tablaSeleccionada.nombre)
        .update(formData)
        .eq("id", itemEditar.id);

      if (error) throw error;

      // Marcar presupuestos afectados como modificados
      await marcarPresupuestosModificados(tablaSeleccionada.nombre, itemEditar.id, formData);

      mostrarAlertaPersonalizada(`✅ ${tablaSeleccionada.display} actualizado. Los presupuestos relacionados han sido notificados.`, "success");
      cerrarModales();
      cargarDatos(tablaSeleccionada.nombre);
    } catch (error) {
      console.error("Error actualizando:", error);
      mostrarAlertaPersonalizada(`❌ Error al actualizar: ${error.message}`, "error");
    }
  }

  async function eliminar(item) {
    setItemEliminar(item);
    setMostrarModalEliminar(true);
  }

  async function confirmarEliminar() {
    if (!itemEliminar) return;

    try {
      // Marcar presupuestos como invalidados ANTES de eliminar
      await invalidarPresupuestos(tablaSeleccionada.nombre, itemEliminar);

      // Eliminar precios relacionados según el tipo
      if (tablaSeleccionada.nombre.includes("_acabados")) {
        const categoria = tablaSeleccionada.nombre.split("_")[0];
        const tablaPrecio = categoria === "compactos" ? "compactos_guias_precios" : `${categoria}_precios`;
        
        
        
        const { error: errorPrecio } = await supabase
          .from(tablaPrecio)
          .delete()
          .eq("acabado_id", itemEliminar.id);
        
        if (errorPrecio) {
          console.error("Error eliminando precios:", errorPrecio);
          throw new Error(`No se pudieron eliminar los precios relacionados: ${errorPrecio.message}`);
        }
      } else if (tablaSeleccionada.nombre.includes("_modelos")) {
        const categoria = tablaSeleccionada.nombre.split("_")[0];
        const tablaPrecio = categoria === "compactos" ? "compactos_guias_precios" : `${categoria}_precios`;
        
        
        
        const { error: errorPrecio } = await supabase
          .from(tablaPrecio)
          .delete()
          .eq("modelo_id", itemEliminar.id);
        
        if (errorPrecio) {
          console.error("Error eliminando precios:", errorPrecio);
          throw new Error(`No se pudieron eliminar los precios relacionados: ${errorPrecio.message}`);
        }
      } else if (tablaSeleccionada.nombre.includes("_colores")) {
        const categoria = tablaSeleccionada.nombre.split("_")[0];
        const tablaPrecio = `${categoria}_precios`;
        
        
        
        const { error: errorPrecio } = await supabase
          .from(tablaPrecio)
          .delete()
          .eq("color_id", itemEliminar.id);
        
        if (errorPrecio) {
          console.error("Error eliminando precios:", errorPrecio);
          throw new Error(`No se pudieron eliminar los precios relacionados: ${errorPrecio.message}`);
        }
      } else if (tablaSeleccionada.nombre.includes("_medidas")) {
        const categoria = tablaSeleccionada.nombre.split("_")[0];
        const tablaPrecio = `${categoria}_precios`;
        
        
        
        const { error: errorPrecio } = await supabase
          .from(tablaPrecio)
          .delete()
          .eq("medida_id", itemEliminar.id);
        
        if (errorPrecio) {
          console.error("Error eliminando precios:", errorPrecio);
          throw new Error(`No se pudieron eliminar los precios relacionados: ${errorPrecio.message}`);
        }
      }

      // Ahora eliminar el item principal
      const { error } = await supabase
        .from(tablaSeleccionada.nombre)
        .delete()
        .eq("id", itemEliminar.id);

      if (error) throw error;

      mostrarAlertaPersonalizada(`✅ ${tablaSeleccionada.display} eliminado. Los presupuestos que lo usaban han sido invalidados.`, "warning");
      setMostrarModalEliminar(false);
      setItemEliminar(null);
      cargarDatos(tablaSeleccionada.nombre);
    } catch (error) {
      console.error("Error eliminando:", error);
      mostrarAlertaPersonalizada(`❌ Error al eliminar: ${error.message}`, "error");
      setMostrarModalEliminar(false);
      setItemEliminar(null);
    }
  }

  function cancelarEliminar() {
    setMostrarModalEliminar(false);
    setItemEliminar(null);
  }

  async function invalidarPresupuestos(nombreTabla, item) {
    try {
      if (nombreTabla.includes("_medidas")) {
        const tipoMap = {
          "mosq": "mosquitera",
          "pergolas": "pergola",
          "puertas": "puerta"
        };
        
        const categoria = nombreTabla.split("_")[0];
        const tipoPresupuesto = tipoMap[categoria] || categoria;
        
        let queryConfig = {};
        
        if (nombreTabla === "mosq_medidas") {
          queryConfig = {
            alto_mm: item.alto_mm,
            ancho_mm: item.ancho_mm,
            tipoLike: "%mosquitera%"
          };
        } else if (nombreTabla === "pergolas_medidas") {
          queryConfig = {
            ancho_mm: item.ancho_mm,
            alto_mm: item.fondo_mm,
            tipoLike: "%pergola%"
          };
        } else if (nombreTabla === "puertas_medidas") {
          queryConfig = {
            ancho_mm: item.ancho_mm,
            alto_mm: item.alto_mm,
            tipoLike: `%${tipoPresupuesto}%`
          };
        } else {
          queryConfig = {
            tipoLike: `%${tipoPresupuesto}%`,
            generic: true
          };
        }

        let query = supabase.from("presupuestos").select("id, tipo, alto_mm, ancho_mm");
        
        if (queryConfig.generic) {
          query = query.like("tipo", queryConfig.tipoLike);
        } else {
          if (queryConfig.alto_mm !== undefined) query = query.eq("alto_mm", queryConfig.alto_mm);
          if (queryConfig.ancho_mm !== undefined) query = query.eq("ancho_mm", queryConfig.ancho_mm);
          if (queryConfig.tipoLike) query = query.like("tipo", queryConfig.tipoLike);
        }

        const { data: presupuestos } = await query;
        const idsAfectados = presupuestos?.map(p => p.id) || [];

        if (idsAfectados.length > 0) {
          const { error } = await supabase
            .from("presupuestos")
            .update({ 
              invalidado: true,
              razon_invalidacion: `Medida eliminada del catálogo`
            })
            .in("id", idsAfectados);

          if (error) {
            console.error("❌ Error actualizando presupuestos:", error);
          } else {
            
          }
        }
      } else if (nombreTabla.includes("_accesorios")) {
        
        
        const { data: presupuestos } = await supabase
          .from("presupuestos")
          .select("*")
          .not("accesorios", "is", null);

        

        const idsAfectados = presupuestos
          ?.filter(p => p.accesorios?.some(acc => acc.id === item.id))
          .map(p => p.id) || [];

        

        if (idsAfectados.length > 0) {
          const { error } = await supabase
            .from("presupuestos")
            .update({ 
              invalidado: true,
              razon_invalidacion: "Accesorio eliminado del catálogo"
            })
            .in("id", idsAfectados);

          if (error) {
            console.error("❌ Error actualizando presupuestos:", error);
          } else {
            
          }
        }
      } else if (nombreTabla.includes("_colores") || nombreTabla.includes("_acabados") || nombreTabla.includes("_modelos")) {
        const categoria = nombreTabla.split("_")[0];
        
        
        
        
        // Mapear nombres de categorías al tipo en presupuestos
        const tipoMap = {
          "compactos": "compacto",
          "panos": "paño",
          "pergolas": "pergola",
          "proteccionsolar": "proteccion-solar",
          "puertas": "puerta",
          "mosq": "mosquitera"
        };
        
        const tipoPresupuesto = tipoMap[categoria] || categoria;
        
        // Determinar qué campo buscar
        let campoABuscar = "color";
        if (nombreTabla.includes("_modelos")) {
          campoABuscar = "modelo";
        } else if (nombreTabla.includes("_acabados")) {
          campoABuscar = "acabado";
        }
        
        
        
        // Buscar presupuestos
        const { data: presupuestos } = await supabase
          .from("presupuestos")
          .select("id, modelo, acabado, color, tipo")
          .eq(campoABuscar, item.nombre)
          .like("tipo", `%${tipoPresupuesto}%`);

        const idsAfectados = presupuestos?.map(p => p.id) || [];
        

        if (idsAfectados.length > 0) {
          const { error } = await supabase
            .from("presupuestos")
            .update({ 
              invalidado: true,
              razon_invalidacion: `"${item.nombre}" eliminado del catálogo`
            })
            .in("id", idsAfectados);

          if (error) {
            console.error("❌ Error actualizando presupuestos:", error);
          } else {
            
          }
        }
      }

      console.log("Presupuestos invalidados correctamente");
    } catch (error) {
      console.error("Error invalidando presupuestos:", error);
    }
  }

  async function marcarPresupuestosModificados(nombreTabla, itemId, nuevosDatos) {
    try {
      const tieneCambioPrecio = Object.keys(nuevosDatos).some(key => 
        key.includes("precio") || key.includes("pvp") || key.includes("incremento")
      );

      if (!tieneCambioPrecio) return;

      let idsAfectados = [];

      if (nombreTabla.includes("_accesorios")) {
        const { data: presupuestos } = await supabase
          .from("presupuestos")
          .select("*")
          .not("accesorios", "is", null);

        idsAfectados = presupuestos
          ?.filter(p => p.accesorios?.some(acc => acc.id === itemId))
          .map(p => p.id) || [];
      } else if (nombreTabla.includes("_colores")) {
        const { data: presupuestos } = await supabase
          .from("presupuestos")
          .select("id")
          .eq("color_id", itemId);

        idsAfectados = presupuestos?.map(p => p.id) || [];
      } else if (nombreTabla.includes("_modelos")) {
        // Obtener el nombre del modelo desde la BD
        const { data: modelo } = await supabase
          .from(nombreTabla)
          .select("nombre")
          .eq("id", itemId)
          .single();

        if (modelo) {
          const categoria = nombreTabla.split("_")[0];
          const { data: presupuestos } = await supabase
            .from("presupuestos")
            .select("id")
            .eq("modelo", modelo.nombre)
            .like("tipo", `%${categoria}%`);

          idsAfectados = presupuestos?.map(p => p.id) || [];
        }
      } else if (nombreTabla.includes("_acabados")) {
        // Obtener el nombre del acabado desde la BD
        const { data: acabado } = await supabase
          .from(nombreTabla)
          .select("nombre")
          .eq("id", itemId)
          .single();

        if (acabado) {
          const categoria = nombreTabla.split("_")[0];
          const { data: presupuestos } = await supabase
            .from("presupuestos")
            .select("id")
            .eq("acabado", acabado.nombre)
            .like("tipo", `%${categoria}%`);

          idsAfectados = presupuestos?.map(p => p.id) || [];
        }
      } else if (nombreTabla.includes("_precios") || nombreTabla.includes("_medidas")) {
        const categoria = nombreTabla.split("_")[0];
        const { data: presupuestos } = await supabase
          .from("presupuestos")
          .select("id")
          .like("tipo", `%${categoria}%`);

        idsAfectados = presupuestos?.map(p => p.id) || [];
      }

      if (idsAfectados.length > 0) {
        await supabase
          .from("presupuestos")
          .update({ 
            precio_desactualizado: true,
            fecha_desactualizacion: new Date().toISOString()
          })
          .in("id", idsAfectados);

        
      }
    } catch (error) {
      console.error("Error marcando presupuestos:", error);
    }
  }

  async function subirImagen(file) {
    if (!file) return null;

    setUploadingImage(true);
    try {
      // Verificar sesión
      const { data: { session } } = await supabase.auth.getSession();
      
      
      if (!session) {
        throw new Error("No hay sesión activa. Por favor, inicia sesión nuevamente.");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const categoria = tablaSeleccionada.nombre.split("_")[0];
      const filePath = `${categoria}/${fileName}`;

      // Subir usando la API pública del storage
      const { data, error: uploadError } = await supabase.storage
        .from("imagenesProductos")
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error("Error de upload:", uploadError);
        throw uploadError;
      }

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from("imagenesProductos")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      mostrarAlertaPersonalizada(`❌ Error al subir la imagen: ${error.message}`, "error");
      return null;
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = await subirImagen(file);
    if (url) {
      if (itemEditar) {
        try {
          await supabase
            .from(tablaSeleccionada.nombre)
            .update({ imagen: url })
            .eq("id", itemEditar.id);
          
          mostrarAlertaPersonalizada("✅ Imagen actualizada correctamente", "success");
          cargarDatos(tablaSeleccionada.nombre);
        } catch (error) {
          mostrarAlertaPersonalizada(`❌ Error guardando imagen: ${error.message}`, "error");
        }
      } else {
        setFormData({ ...formData, imagen: url });
        mostrarAlertaPersonalizada("✅ Imagen cargada. Haz click en Guardar para completar.", "info");
      }
    }
  }

  function renderInput(col, value) {
    const esActivo = col === "activo";
    const esPerimetral = col === "perimetral";
    const esNumero = col.includes("precio") || col.includes("pvp") || 
                     col.includes("incremento") || col.includes("_m2") || 
                     col.includes("_ml") || col === "orden";
    const esColor = col === "hex";
    const esTipoMosquitera = col === "tipo" && tablaSeleccionada?.nombre === "mosq_medidas";
    const esUnidad = col === "unidad";
    const esTablaPrecios = tablaSeleccionada?.nombre?.includes("_precios") || 
                           tablaSeleccionada?.nombre?.includes("_guias_precios");

    // Unidad (ml o ud)
    if (esUnidad) {
      return (
        <select
          value={value || ""}
          onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
          className={styles.input}
          required
        >
          <option value="">Seleccionar unidad...</option>
          <option value="ml">ml (metro lineal)</option>
          <option value="ud">ud (unidad)</option>
        </select>
      );
    }

    // Tipo de mosquitera
    if (esTipoMosquitera) {
      return (
        <select
          value={value || ""}
          onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
          className={styles.input}
          style={{ cursor: "pointer" }}
        >
          <option value="">Seleccionar tipo...</option>
          <option value="enrollable">Enrollable</option>
          <option value="plisada">Plisada</option>
          <option value="corredera">Corredera</option>
          <option value="fija">Fija</option>
          <option value="abatible">Abatible</option>
          <option value="lateral">Lateral</option>
        </select>
      );
    }

    // Checkbox perimetral
    if (esPerimetral) {
      return (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.checked })}
          />
          <span>{value ? "Perimetral" : "No perimetral"}</span>
        </label>
      );
    }

    // Checkbox activo
    if (esActivo) {
      return (
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.checked })}
          />
          <span>{value ? "Activo" : "Inactivo"}</span>
        </label>
      );
    }

    // Color hex
    if (esColor) {
      return (
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
            style={{ width: "50px", height: "40px" }}
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
            className={styles.input}
            placeholder="#000000"
          />
        </div>
      );
    }

    // Selectores para tablas de precios
    if (esTablaPrecios) {
      // Modelo ID
      if (col === "modelo_id") {
        // Filtrar modelos que ya tienen precio con el acabado seleccionado
        const modelosDisponibles = datosRelacionados.modelos?.filter(m => {
          if (!formData.acabado_id) return true; // Si no hay acabado seleccionado, mostrar todos
          // Verificar si ya existe esta combinación
          const existeCombinacion = datos.some(d => 
            d.modelo_id === m.id && d.acabado_id === formData.acabado_id
          );
          return !existeCombinacion;
        }) || [];

        return (
          <select
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
            className={styles.input}
            required
          >
            <option value="">Seleccionar modelo...</option>
            {modelosDisponibles.map(m => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
        );
      }

      // Acabado ID
      if (col === "acabado_id") {
        // Filtrar acabados que ya tienen precio con el modelo seleccionado
        const acabadosDisponibles = datosRelacionados.acabados?.filter(a => {
          if (!formData.modelo_id) return true; // Si no hay modelo seleccionado, mostrar todos
          // Verificar si ya existe esta combinación
          const existeCombinacion = datos.some(d => 
            d.modelo_id === formData.modelo_id && d.acabado_id === a.id
          );
          return !existeCombinacion;
        }) || [];

        return (
          <select
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
            className={styles.input}
            required
          >
            <option value="">Seleccionar acabado...</option>
            {acabadosDisponibles.map(a => (
              <option key={a.id} value={a.id}>{a.nombre}</option>
            ))}
          </select>
        );
      }

      // Color ID
      if (col === "color_id") {
        // Para pérgolas y puertas: filtrar colores que ya existen con la medida seleccionada
        let coloresDisponibles = datosRelacionados.colores || [];
        
        if (tablaSeleccionada.nombre === "pergolas_precios") {
          const anchoSel = formData.ancho_mm;
          const fondoSel = formData.fondo_mm;
          if (anchoSel && fondoSel) {
            coloresDisponibles = coloresDisponibles.filter(c => {
              const existeCombinacion = datos.some(d => 
                d.ancho_mm === parseInt(anchoSel) && 
                d.fondo_mm === parseInt(fondoSel) && 
                d.color_id === c.id
              );
              return !existeCombinacion;
            });
          }
        }

        if (tablaSeleccionada.nombre === "puertas_precios") {
          const anchoSel = formData.ancho_mm;
          const altoSel = formData.alto_mm;
          if (anchoSel && altoSel) {
            coloresDisponibles = coloresDisponibles.filter(c => {
              const existeCombinacion = datos.some(d => 
                d.ancho_mm === parseInt(anchoSel) && 
                d.alto_mm === parseInt(altoSel) && 
                d.color_id === c.id
              );
              return !existeCombinacion;
            });
          }
        }

        if (tablaSeleccionada.nombre === "proteccionsolar_precios") {
          const modeloSel = formData.modelo_id;
          if (modeloSel) {
            coloresDisponibles = coloresDisponibles.filter(c => {
              const existeCombinacion = datos.some(d => 
                d.modelo_id === modeloSel && d.color_id === c.id
              );
              return !existeCombinacion;
            });
          }
        }

        return (
          <select
            value={value || ""}
            onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
            className={styles.input}
            required
          >
            <option value="">Seleccionar color...</option>
            {coloresDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        );
      }

      // Medidas para pérgolas y puertas
      if (col === "ancho_mm" && (tablaSeleccionada.nombre === "pergolas_precios" || tablaSeleccionada.nombre === "puertas_precios")) {
        const medidas = datosRelacionados.medidas || [];
        const anchosUnicos = [...new Set(medidas.map(m => m.ancho_mm))].sort((a, b) => a - b);
        
        return (
          <select
            value={value || ""}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                [col]: parseInt(e.target.value),
                // Reset fondo/alto cuando cambia ancho
                ...(tablaSeleccionada.nombre === "pergolas_precios" && { fondo_mm: "" }),
                ...(tablaSeleccionada.nombre === "puertas_precios" && { alto_mm: "" }),
                color_id: "" // Reset color también
              });
            }}
            className={styles.input}
            required
          >
            <option value="">Seleccionar ancho...</option>
            {anchosUnicos.map(ancho => (
              <option key={ancho} value={ancho}>{ancho} mm</option>
            ))}
          </select>
        );
      }

      if (col === "fondo_mm" && tablaSeleccionada.nombre === "pergolas_precios") {
        const medidas = datosRelacionados.medidas || [];
        const anchoSeleccionado = formData.ancho_mm;
        const fondosDisponibles = anchoSeleccionado 
          ? medidas.filter(m => m.ancho_mm === parseInt(anchoSeleccionado)).map(m => m.fondo_mm)
          : [...new Set(medidas.map(m => m.fondo_mm))];
        const fondosUnicos = [...new Set(fondosDisponibles)].sort((a, b) => a - b);
        
        return (
          <select
            value={value || ""}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                [col]: parseInt(e.target.value),
                color_id: "" // Reset color cuando cambia fondo
              });
            }}
            className={styles.input}
            required
            disabled={!anchoSeleccionado}
          >
            <option value="">{anchoSeleccionado ? "Seleccionar fondo..." : "Primero selecciona ancho"}</option>
            {fondosUnicos.map(fondo => (
              <option key={fondo} value={fondo}>{fondo} mm</option>
            ))}
          </select>
        );
      }

      if (col === "alto_mm" && tablaSeleccionada.nombre === "puertas_precios") {
        const medidas = datosRelacionados.medidas || [];
        const anchoSeleccionado = formData.ancho_mm;
        const altosDisponibles = anchoSeleccionado 
          ? medidas.filter(m => m.ancho_mm === parseInt(anchoSeleccionado)).map(m => m.alto_mm)
          : [...new Set(medidas.map(m => m.alto_mm))];
        const altosUnicos = [...new Set(altosDisponibles)].sort((a, b) => a - b);
        
        return (
          <select
            value={value || ""}
            onChange={(e) => {
              setFormData({ 
                ...formData, 
                [col]: parseInt(e.target.value),
                color_id: "" // Reset color cuando cambia alto
              });
            }}
            className={styles.input}
            required
            disabled={!anchoSeleccionado}
          >
            <option value="">{anchoSeleccionado ? "Seleccionar alto..." : "Primero selecciona ancho"}</option>
            {altosUnicos.map(alto => (
              <option key={alto} value={alto}>{alto} mm</option>
            ))}
          </select>
        );
      }
    }

    // Números
    if (esNumero) {
      return (
        <input
          type="number"
          step="0.01"
          value={value || ""}
          onChange={(e) => setFormData({ ...formData, [col]: parseFloat(e.target.value) || 0 })}
          className={styles.input}
        />
      );
    }

    // Medidas en mm (fuera de tablas de precios)
    if (col.includes("_mm")) {
      return (
        <input
          type="number"
          value={value || ""}
          onChange={(e) => setFormData({ ...formData, [col]: parseInt(e.target.value) || 0 })}
          className={styles.input}
          placeholder="mm"
        />
      );
    }

    // Texto por defecto
    return (
      <input
        type="text"
        value={value || ""}
        onChange={(e) => setFormData({ ...formData, [col]: e.target.value })}
        className={styles.input}
      />
    );
  }

  function renderValor(col, valor) {
    if (col === "activo") {
      return valor ? (
        <span className={`${styles.badge} ${styles.badgeSuccess}`}>✓ Activo</span>
      ) : (
        <span className={`${styles.badge} ${styles.badgeDanger}`}>✗ Inactivo</span>
      );
    }

    if (col === "imagen" && valor) {
      return <img src={valor} alt="Imagen" style={{ maxWidth: "50px", maxHeight: "50px" }} />;
    }

    if (col === "hex" && valor) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              backgroundColor: valor,
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <span>{valor}</span>
        </div>
      );
    }

    if (col.includes("precio") || col.includes("pvp") || col.includes("incremento")) {
      return `${parseFloat(valor || 0).toFixed(2)} €`;
    }

    if (col.includes("_mm")) {
      return `${valor} mm`;
    }

    if (col.includes("_m2")) {
      return `${parseFloat(valor || 0).toFixed(2)} €/m²`;
    }

    if (col.includes("_ml")) {
      return `${parseFloat(valor || 0).toFixed(2)} €/ml`;
    }

    return valor;
  }

  if (loading || !session) {
    return (
      <div className={styles.pageContainer}>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Productos · PresuProsol</title>
      </Head>
      <Header />

      <main className={styles.pageContainer}>
        {/* Alerta personalizada */}
        {mostrarAlerta && (
          <div 
            className={`${styles.alert} ${
              tipoAlerta === "success" ? styles.alertSuccess :
              tipoAlerta === "error" ? styles.alertDanger :
              tipoAlerta === "warning" ? styles.alertWarning :
              styles.alertInfo
            }`}
            style={{
              position: "fixed",
              top: "80px",
              right: "20px",
              zIndex: 10000,
              minWidth: "300px",
              animation: "slideInRight 0.3s ease-out"
            }}
          >
            {mensajeAlerta}
          </div>
        )}

        <div className={styles.header}>
          <h1 className={styles.title}>Administración de Productos</h1>
          <button
            onClick={() => router.push("/perfil")}
            className={styles.backButton}
          >
            ← Volver
          </button>
        </div>

        <div className={styles.adminLayout}>
          {/* Sidebar con categorías */}
          <div className={styles.sidebar}>
            <h3 className={styles.sidebarTitle}>Categorías</h3>
            {CATEGORIAS.map((cat) => (
              <div key={cat.id} className={styles.categoriaGroup}>
                <button 
                  className={styles.categoriaHeader}
                  onClick={() => toggleCategoria(cat.id)}
                >
                  <h4 className={styles.categoriaNombre}>{cat.nombre}</h4>
                  <span className={styles.categoriaIcon}>
                    {categoriasExpandidas[cat.id] ? '▼' : '▶'}
                  </span>
                </button>
                <div className={`${styles.tablasContainer} ${categoriasExpandidas[cat.id] ? styles.tablasExpanded : ''}`}>
                  {cat.tablas.map((tabla) => (
                    <button
                      key={tabla.nombre}
                      className={`${styles.tablaBtn} ${
                        tablaSeleccionada?.nombre === tabla.nombre ? styles.tablaBtnActive : ""
                      }`}
                      onClick={() => seleccionarTabla(cat, tabla)}
                    >
                      {tabla.display}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contenido principal */}
          <div className={styles.mainContent}>
            {!tablaSeleccionada ? (
              <div className={styles.emptyState}>
                <p>Selecciona una tabla del menú lateral para comenzar</p>
              </div>
            ) : (
              <>
                <div className={styles.contentHeader}>
                  <h2 className={styles.contentTitle}>
                    {categoriaSeleccionada.nombre} - {tablaSeleccionada.display}
                  </h2>
                </div>

                <div className={styles.tableControls}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button onClick={abrirModalNuevo} className={styles.btnPrimary}>
                    + Nuevo
                  </button>
                </div>

                {loadingData ? (
                  <p>Cargando datos...</p>
                ) : datosFiltrados.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>{filtroTexto ? "No se encontraron resultados" : "No hay elementos en esta tabla"}</p>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: "1rem", color: "#718096", fontSize: "0.875rem" }}>
                      Mostrando {datosFiltrados.length} de {datos.length} elementos
                    </div>
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>ID</th>
                            {tablaSeleccionada.tieneImagen && <th>Imagen</th>}
                            {columnas.map((col) => (
                              <th key={col}>{col}</th>
                            ))}
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datosFiltrados.map((item) => (
                            <tr key={item.id}>
                              <td>{item.id}</td>
                              {tablaSeleccionada.tieneImagen && (
                                <td>
                                  {item.imagen ? (
                                    <img 
                                      src={item.imagen} 
                                      alt="Imagen" 
                                      style={{ maxWidth: "50px", maxHeight: "50px", objectFit: "cover" }} 
                                    />
                                  ) : (
                                    <span style={{ color: "#999" }}>Sin imagen</span>
                                  )}
                                </td>
                              )}
                              {columnas.map((col) => (
                                <td key={col}>{renderValor(col, item[col])}</td>
                              ))}
                              <td>
                                <div className={styles.btnGroup}>
                                  <button
                                    className={styles.btnEdit}
                                    onClick={() => abrirModalEditar(item)}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className={styles.btnDelete}
                                    onClick={() => eliminar(item)}
                                    title="Eliminar"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Modal Nuevo */}
      {mostrarModalNuevo && (
        <div className={styles.modalOverlay} onClick={cerrarModales}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>
                Nuevo {tablaSeleccionada.display}
              </h5>
              <button className={styles.closeButton} onClick={cerrarModales}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {tablaSeleccionada.tieneImagen && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Imagen</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.inputFile}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p style={{ color: "#ff8a00" }}>Subiendo imagen...</p>}
                  {formData.imagen && (
                    <img 
                      src={formData.imagen} 
                      alt="Preview" 
                      style={{ maxWidth: "150px", marginTop: "0.5rem" }} 
                    />
                  )}
                </div>
              )}
              {columnas.map((col) => (
                <div key={col} className={styles.formGroup}>
                  <label className={styles.label}>{col}</label>
                  {renderInput(col, formData[col])}
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={cerrarModales}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={guardarNuevo}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {mostrarModalEditar && (
        <div className={styles.modalOverlay} onClick={cerrarModales}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h5 className={styles.modalTitle}>
                Editar {tablaSeleccionada.display} (ID: {itemEditar.id})
              </h5>
              <button className={styles.closeButton} onClick={cerrarModales}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {tablaSeleccionada.tieneImagen && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Imagen</label>
                  {itemEditar.imagen && (
                    <div style={{ marginBottom: "0.5rem" }}>
                      <img 
                        src={itemEditar.imagen} 
                        alt="Actual" 
                        style={{ maxWidth: "150px", border: "2px solid #e2e8f0", borderRadius: "6px" }} 
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.inputFile}
                    disabled={uploadingImage}
                  />
                  {uploadingImage && <p style={{ color: "#ff8a00" }}>Subiendo nueva imagen...</p>}
                </div>
              )}
              {columnas.map((col) => (
                <div key={col} className={styles.formGroup}>
                  <label className={styles.label}>{col}</label>
                  {renderInput(col, formData[col])}
                </div>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={cerrarModales}>
                Cancelar
              </button>
              <button className={styles.btnPrimary} onClick={guardarEdicion}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Personalizado */}
      {mostrarModalEliminar && (
        <div className={styles.modalOverlay} onClick={cancelarEliminar}>
          <div className={styles.modalEliminar} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalEliminarIcono}>⚠️</div>
            <h3 className={styles.modalEliminarTitulo}>¿Eliminar elemento?</h3>
            <p className={styles.modalEliminarTexto}>
              Esta acción invalidará todos los presupuestos que usen este elemento.
              <br />
              Los usuarios no podrán editar ni pagar esos presupuestos.
            </p>
            <div className={styles.modalEliminarBotones}>
              <button 
                className={styles.btnCancelar} 
                onClick={cancelarEliminar}
              >
                Cancelar
              </button>
              <button 
                className={styles.btnEliminar} 
                onClick={confirmarEliminar}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
