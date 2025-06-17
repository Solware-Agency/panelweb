import { mapPaymentsToColumns } from "./payment-mapper";
import { calculatePaymentDetails } from "./payment-utils";
import { FormValues } from "./form-schema";

export function prepareSubmissionData(data: FormValues, exchangeRate: number | undefined) {
  const { paymentStatus, missingAmount } = calculatePaymentDetails(
    data.payments,
    data.totalAmount,
    exchangeRate
  );
  const paymentsColumns = mapPaymentsToColumns(data.payments);

  return {
    fullName: data.fullName,
    idNumber: data.idNumber,
    phone: data.phone,
    age: data.age,
    email: data.email,
    examType: data.examType,
    origin: data.origin,
    treatingDoctor: data.treatingDoctor,
    sampleType: data.sampleType,
    numberOfSamples: data.numberOfSamples,
    relationship: data.relationship,
    branch: data.branch,
    date: data.date instanceof Date ? data.date.toISOString() : data.date,
    totalAmount: data.totalAmount,
    comments: data.comments,
    exchangeRate: exchangeRate || null,
    paymentStatus: paymentStatus || "N/A",
    remaining: paymentStatus === "Completado" ? 0 : missingAmount,
    ...paymentsColumns,
  };
}