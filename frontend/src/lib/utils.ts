import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) return "S/ 0.00";
  return `S/ ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
}

export function numeroALetras(num: number): string {
  const Unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE", "VEINTIUN", "VEINTIDOS", "VEINTITRES", "VEINTICUATRO", "VEINTICINCO", "VEINTISEIS", "VEINTISIETE", "VEINTIOCHO", "VEINTINUEVE"];
  const Decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
  const Centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

  function DecenasY(strSin: string, numUnidades: number) {
    if (numUnidades > 0) return strSin + " Y " + Unidades[numUnidades];
    return strSin;
  }

  function leerDecenas(numero: number): string {
    if (numero < 30) return Unidades[numero];
    const decena = Math.floor(numero / 10);
    const unidad = numero - (decena * 10);
    return DecenasY(Decenas[decena], unidad);
  }

  function leerCentenas(numero: number): string {
    const centena = Math.floor(numero / 100);
    const decena = numero - (centena * 100);
    if (centena === 0) return leerDecenas(decena);
    if (centena === 1 && decena === 0) return "CIEN";
    return Centenas[centena] + (decena > 0 ? " " + leerDecenas(decena) : "");
  }

  function leerMiles(numero: number): string {
    const millar = Math.floor(numero / 1000);
    const centena = numero - (millar * 1000);
    if (millar === 0) return leerCentenas(centena);
    if (millar === 1) return "MIL" + (centena > 0 ? " " + leerCentenas(centena) : "");
    return leerCentenas(millar) + " MIL" + (centena > 0 ? " " + leerCentenas(centena) : "");
  }

  function leerMillones(numero: number): string {
    const millon = Math.floor(numero / 1000000);
    const millar = numero - (millon * 1000000);
    if (millon === 0) return leerMiles(millar);
    if (millon === 1) return "UN MILLON" + (millar > 0 ? " " + leerMiles(millar) : "");
    return leerMiles(millon) + " MILLONES" + (millar > 0 ? " " + leerMiles(millar) : "");
  }

  if (num === 0) return "CERO";
  
  const entero = Math.floor(num);
  const decimales = Math.round((num - entero) * 100);
  
  const letras = leerMillones(entero);
  return `${letras} CON ${decimales.toString().padStart(2, '0')}/100`;
}
