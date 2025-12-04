// context/AuthContext.js
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(undefined); // undefined = cargando, null = no hay sesión
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionRef = useRef(null); // Referencia para trackear sesión actual sin depender del estado

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (userId) => {
      
      try {
        const { data, error } = await supabase
          .from("usuarios")
          .select(
            "id, usuario, email, cif, habilitado, rol, telefono, direccion, nacionalidad, foto_url"
          )
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("[AuthContext] Error cargando perfil:", error);
          return null;
        }

        

        if (mounted) {
          setProfile(data ?? null);
        }
        
        return data;
      } catch (err) {
        console.error("[AuthContext] Exception cargando perfil:", err);
        return null;
      }
    };

    const initSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("[AuthContext] Error obteniendo sesión:", error);
          if (mounted) {
            setSession(null);
            sessionRef.current = null;
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        if (!mounted) return;

        
        setSession(currentSession);
        sessionRef.current = currentSession; // Guardar en ref

        if (currentSession?.user?.id) {
          await loadProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error("[AuthContext] Exception en initSession:", err);
        if (mounted) {
          setSession(null);
          sessionRef.current = null;
          setProfile(null);
          setLoading(false);
        }
      }
    };

    initSession();

    // Listener de cambios de autenticación con mejor manejo
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) {
        
        return;
      }

      // SIGNED_OUT: Limpiar todo
      if (event === 'SIGNED_OUT') {
        
        setSession(null);
        sessionRef.current = null;
        setProfile(null);
        setLoading(false);
        
        return;
      }

      // INITIAL_SESSION: Primera carga, ya se maneja en initSession
      if (event === 'INITIAL_SESSION') {
        return;
      }

      // TOKEN_REFRESHED: Solo actualizar token, no recargar perfil
      if (event === 'TOKEN_REFRESHED') {
        
        setSession(currentSession);
        sessionRef.current = currentSession;
        
        return;
      }

      // SIGNED_IN: Solo procesar si NO teníamos sesión previa (login real)
      if (event === 'SIGNED_IN') {
        // Usar ref para comparar (más confiable que el estado)
        const prevUserId = sessionRef.current?.user?.id;
        const newUserId = currentSession?.user?.id;
        
        if (prevUserId && prevUserId === newUserId) {
          return;
        }
        
        // Login nuevo: actualizar sesión y cargar perfil
        
        setSession(currentSession);
        sessionRef.current = currentSession;
        if (currentSession?.user?.id) {
          await loadProfile(currentSession?.user?.id);
        }
        setLoading(false);
        
        return;
      }

      // Otros eventos: manejar por defecto
      
      setSession(currentSession);
      sessionRef.current = currentSession;

      if (currentSession?.user?.id && !profile) {
        
        await loadProfile(currentSession.user.id);
      } else if (!currentSession) {
        setProfile(null);
      }
      
      setLoading(false);
      
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = async (newData) => {
    if (newData) {
      setProfile((prev) => ({ ...(prev || {}), ...newData }));
      return;
    }

    if (session?.user?.id) {
      const { data } = await supabase
        .from("usuarios")
        .select(
          "id, usuario, email, cif, habilitado, rol, telefono, direccion, nacionalidad, foto_url"
        )
        .eq("id", session.user.id)
        .maybeSingle();

      setProfile(data ?? null);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setProfile(null);
    } catch (err) {
      console.error("[AuthContext] Error en signOut:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ session, profile, loading, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
