export function authErrorMessage(error: unknown): string {
  const failure = error as { code?: string; message?: string } | null;
  const messages: Record<string, string> = {
    invalid_credentials: 'El correo o la contraseña no son correctos.',
    email_not_confirmed: 'Confirma tu correo antes de iniciar sesión.',
    user_already_exists: 'Ya existe una cuenta con ese correo. Accede o recupera tu contraseña.',
    email_exists: 'Ya existe una cuenta con ese correo. Accede o recupera tu contraseña.',
    email_address_invalid: 'Escribe un correo electrónico válido.',
    email_address_not_authorized: 'El envío de correos aún está limitado a las cuentas de prueba autorizadas. Contacta con Eventin.',
    weak_password: 'Elige una contraseña más segura, de al menos 8 caracteres.',
    over_email_send_rate_limit: 'Se enviaron demasiadas solicitudes de correo. Espera unos minutos e inténtalo de nuevo.',
    over_request_rate_limit: 'Hay demasiados intentos. Espera unos minutos antes de volver a intentar.',
    signup_disabled: 'El registro no está disponible temporalmente.',
    otp_expired: 'El enlace expiró o ya fue utilizado. Solicita uno nuevo.',
    flow_state_expired: 'El enlace expiró. Solicita uno nuevo desde este navegador.',
    bad_code_verifier: 'Abre el enlace en el mismo navegador donde iniciaste la solicitud.',
  };
  if (failure?.code && messages[failure.code]) return messages[failure.code];
  if (failure?.message?.toLowerCase().includes('invalid login credentials')) return messages.invalid_credentials;
  return 'No se pudo completar la solicitud. Revisa tu conexión e inténtalo de nuevo en unos minutos.';
}
