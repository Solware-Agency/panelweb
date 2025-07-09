import { type Control } from 'react-hook-form'
import { type FormValues } from '@features/form/lib/form-schema'
import { FormField, FormItem, FormControl, FormMessage } from '@shared/components/ui/form'
import { Textarea } from '@shared/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card'
import { memo } from 'react'

interface CommentsSectionProps {
	control: Control<FormValues>
	inputStyles: string
}

export const CommentsSection = memo(({ control, inputStyles }: CommentsSectionProps) => (
	<Card className="transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/20">
		<CardHeader className="p-3 sm:p-4 md:p-6">
			<CardTitle className="text-base sm:text-lg md:text-xl">Comentarios</CardTitle>
			<div className="w-12 sm:w-16 md:w-20 h-1 bg-primary mt-1 rounded-full" />
		</CardHeader>
		<CardContent className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
			<FormField
				control={control}
				name="comments"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<Textarea
								placeholder="Añadir comentarios adicionales..."
								className={`${inputStyles} min-h-[80px] sm:min-h-[100px]`}
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</CardContent>
	</Card>
))

CommentsSection.displayName = 'CommentsSection'