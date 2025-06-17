import React from "react";
import { type Control, useWatch } from "react-hook-form";
import { type FormValues } from "@/lib/form-schema";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentHeaderProps {
  control: Control<FormValues>;
  inputStyles: string;
  exchangeRate?: number;
  isLoadingRate?: boolean;
}

export const PaymentHeader = ({ control, inputStyles, exchangeRate, isLoadingRate }: PaymentHeaderProps) => {
  const totalAmount = useWatch({
    control,
    name: "totalAmount"
  });

  const totalInVes = React.useMemo(() => {
    if (exchangeRate && totalAmount) {
      const amount = parseFloat(totalAmount as any);
      if (!isNaN(amount) && amount > 0) {
        return (amount * exchangeRate).toFixed(2);
      }
    }
    return null;
  }, [totalAmount, exchangeRate]);

  return (
    <React.Fragment>
      <FormField control={control} name="branch" render={({ field }) => (
        <FormItem><FormLabel>Sede *</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className={inputStyles}><SelectValue placeholder="Seleccione una sede" /></SelectTrigger></FormControl><SelectContent><SelectItem value="PMG">PMG</SelectItem><SelectItem value="CPC">CPC</SelectItem><SelectItem value="CNX">CNX</SelectItem><SelectItem value="STX">STX</SelectItem><SelectItem value="MCY">MCY</SelectItem></SelectContent></Select><FormMessage /></FormItem>
      )}/>
      <FormField control={control} name="totalAmount" render={({ field }) => (
        <FormItem>
          <FormLabel>Monto Total ($) *</FormLabel>
          <FormControl>
            <Input type="number" step="0.01" placeholder="Monto Total en USD" {...field} className={inputStyles} />
          </FormControl>
          {totalInVes && (
            <p className="text-sm font-bold text-green-600">{totalInVes} VES</p>
          )}
          <p className="text-xs text-muted-foreground">
            {isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
          </p>
          <FormMessage />
        </FormItem>
      )}/>
    </React.Fragment>
  );
};