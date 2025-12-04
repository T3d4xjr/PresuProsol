// src/lib/emailNotifications.js

// Import dinámico para evitar problemas de SSR en Next.js
async function emailjsClient() {
  return (await import("@emailjs/browser")).default;
}

/* ============================================================================
   1) AVISO ESTADO USUARIO (habilitado / deshabilitado)
   ==========================================================================*/
export async function enviarAvisoEstadoUsuario({ email, usuario, estado }) {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("❗ Config EmailJS usuario incompleta", {
        serviceId,
        templateId,
        publicKey,
      });
      return;
    }

    const emailjs = await emailjsClient();

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        to_name: usuario || email,
        estado, // "habilitado" / "deshabilitado"
      },
      publicKey
    );

    
  } catch (err) {
    console.error("❌ Error email usuario:", err);
  }
}

/* ============================================================================
   2) AVISO PEDIDO ENVIANDO  (En proceso -> Enviando)
   ==========================================================================*/
export async function enviarAvisoPedidoEnviado({ email, nombre }) {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_PEDIDOS_TEMPLATE_ID; // TEMPLATE "ENVIANDO"
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("❗ Config EmailJS pedidos (Enviando) incompleta", {
        serviceId,
        templateId,
        publicKey,
      });
      return;
    }

    const emailjs = await emailjsClient();

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,          
        to_name: nombre || email, 
      },
      publicKey
    );

    
  } catch (err) {
    console.error("❌ Error email pedido ENVIANDO:", err);
  }
}

/* ============================================================================
   3) AVISO PEDIDO ENTREGADO (por si lo usas más adelante)
   ==========================================================================*/
export async function enviarAvisoPedidoEntregado({ email, usuario }) {
  try {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId =
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_PEDIDO_ENTREGADO;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("❗ Config EmailJS pedidos (Entregado) incompleta", {
        serviceId,
        templateId,
        publicKey,
      });
      return;
    }

    const emailjs = await emailjsClient();

    await emailjs.send(
      serviceId,
      templateId,
      {
        to_email: email,
        to_name: usuario || email,
      },
      publicKey
    );

    
  } catch (err) {
    console.error("❌ Error email pedido ENTREGADO:", err);
  }
}
