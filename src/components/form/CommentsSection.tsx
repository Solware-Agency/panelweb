import { type Control } from "react-hook-form";
import { type FormValues } from "@/lib/form-schema";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CommentsSectionProps {
  control: Control<FormValues>;
  inputStyles: string;
}

export const CommentsSection = ({ control, inputStyles }: CommentsSectionProps) => (
  <Card className="transition-all duration-300 hover:border-primary hover:-translate-y-1">
      <CardHeader>
          <CardTitle>Comentarios</CardTitle>
          <div className="w-20 h-1 bg-primary mt-1 rounded-full" />
      </CardHeader>
      <CardContent>
          <FormField control={control} name="comments" render={({ field }) => (
              <FormItem><FormControl><Textarea placeholder="Añadir comentarios adicionales..." className={`${inputStyles} min-h-[100px]`} {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
      </CardContent>
  </Card>
);