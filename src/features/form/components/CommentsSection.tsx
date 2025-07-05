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
		<CardHeader className="p-4 sm:p-6">
			<CardTitle className="text-lg sm:text-xl">Comentarios</CardTitle>
			<div className="w-16 sm:w-20 h-1 bg-primary mt-1 rounded-full" />
		</CardHeader>
		<CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
			<FormField
				control={control}
				name="comments"
				render={({ field }) => (
					<FormItem>
						<FormControl>
							<Textarea
								placeholder="Añadir comentarios adicionales..."
								className={`${inputStyles} min-h-[100px]`}
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