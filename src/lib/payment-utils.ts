import { FormValues } from "./form-schema";

type Payment = FormValues['payments'][0];

export const calculatePaymentDetails = (
  payments: Payment[],
  totalAmount: number | string | undefined,
  exchangeRate: number | undefined
) => {
  const totalAmountValue = parseFloat(totalAmount as any) || 0;

  const currentTotalPaid = payments.reduce((acc, payment) => {
    const amount = parseFloat(payment.amount as any) || 0;
    if (!payment.method || !amount) return acc;

    const isBolivares = ["Punto de venta", "Pago móvil", "Bs en efectivo"].includes(payment.method);
    
    if (isBolivares) {
      if (exchangeRate && exchangeRate > 0) {
        return acc + (amount / exchangeRate);
      }
      return acc;
    } else {
      return acc + amount;
    }
  }, 0);

  let paymentStatus: string | null = null;
  let isPaymentComplete = false;
  let missingAmount = 0;

  if (totalAmountValue > 0) {
    // Redondea total pagado a 2 decimales
    const finalTotalPaid = parseFloat(currentTotalPaid.toFixed(2));
    missingAmount = parseFloat((totalAmountValue - finalTotalPaid).toFixed(2));
    isPaymentComplete = Math.abs(finalTotalPaid - totalAmountValue) < 0.01;

    if (isPaymentComplete) {
      paymentStatus = "Completado";
      missingAmount = 0;
    } else {
      // Si falta menos de 1 centavo, no mostrar nada
      if (missingAmount > 0.009) {
        paymentStatus = `Incompleto: falta $${missingAmount.toFixed(2)}`;
      } else {
        paymentStatus = "Incompleto";
      }
    }
  }
  
  return { paymentStatus, isPaymentComplete, missingAmount };
};