<?php
header('Content-Type: text/html; charset=utf-8'); // Para caracteres especiales

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // --- Recoge los datos del formulario ---
    // Sanitizar es MUY IMPORTANTE para evitar inyecciones
    $nombre = filter_input(INPUT_POST, 'nombre', FILTER_SANITIZE_SPECIAL_CHARS);
    $email_remitente = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $mensaje = filter_input(INPUT_POST, 'mensaje', FILTER_SANITIZE_SPECIAL_CHARS);
    $rating = filter_input(INPUT_POST, 'rating', FILTER_SANITIZE_NUMBER_INT); // Recoge el rating

    // --- Validación básica (puedes añadir más) ---
    if (empty($nombre) || empty($email_remitente) || empty($mensaje) || !filter_var($email_remitente, FILTER_VALIDATE_EMAIL)) {
        // Error: Datos inválidos o faltantes
        echo "Error: Por favor, completa todos los campos correctamente.";
        // Podrías redirigir de vuelta al formulario con un mensaje de error
        // header('Location: contacto.html?status=error');
        exit; // Detiene la ejecución del script
    }

    // --- Configuración del Correo ---
    $destinatario = "juanangel.pachecovalencia@gmail.com"; // <<-- ¡¡CAMBIA ESTO POR TU CORREO!!
    $asunto = "Nuevo Mensaje de Contacto - SIGLO XXI";

    // --- Construye el cuerpo del mensaje ---
    $cuerpo_mensaje = "Has recibido un nuevo mensaje desde el formulario de contacto:\n\n";
    $cuerpo_mensaje .= "Nombre: " . $nombre . "\n";
    $cuerpo_mensaje .= "Email: " . $email_remitente . "\n";
    if (!empty($rating)) { // Añade el rating si se seleccionó
        $cuerpo_mensaje .= "Rating: " . $rating . " estrellas\n";
    } else {
        $cuerpo_mensaje .= "Rating: No calificado\n";
    }
    $cuerpo_mensaje .= "\nMensaje:\n" . $mensaje . "\n";

    // --- Cabeceras del Correo ---
    // Esencial para que funcione 'Responder a' y evitar que parezca spam
    $cabeceras = "From: webmaster@" . $_SERVER['HTTP_HOST'] . "\r\n"; // Usa un correo del dominio del servidor
    $cabeceras .= "Reply-To: " . $email_remitente . "\r\n";
    $cabeceras .= "Content-Type: text/plain; charset=utf-8\r\n"; // Asegura codificación correcta
    $cabeceras .= "X-Mailer: PHP/" . phpversion();

    // --- Envía el Correo ---
    // La función mail() depende de la configuración del servidor. Puede no funcionar en todos los hostings.
    if (mail($destinatario, $asunto, $cuerpo_mensaje, $cabeceras)) {
        // Éxito: Redirige a una página de agradecimiento o de vuelta con mensaje
        // header('Location: contacto.html?status=success'); // Opción 1: Redirigir
        echo "¡Mensaje enviado con éxito! Gracias por contactarnos."; // Opción 2: Mostrar mensaje simple
    } else {
        // Error de envío
        // header('Location: contacto.html?status=send_error'); // Opción 1: Redirigir
        echo "Error: Hubo un problema al enviar el mensaje. Por favor, inténtalo más tarde."; // Opción 2: Mostrar mensaje simple
    }

} else {
    // Si alguien intenta acceder directamente a send_email.php
    echo "Acceso no permitido.";
    exit;
}
?>