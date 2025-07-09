import { Input } from '@shared/components/ui/input'
import { FormLabel } from '@shared/components/ui/form'
import { memo} from 'react'
import { DollarSign } from 'lucide-react'
import { createCalculatorInputHandler } from '@shared/utils/number-utils'

interface CurrencyConverterProps {
	usdValue: string
	setUsdValue: (value: string) => void
	vesValue: string
	vesInputValue: string
	setVesInputValue: (value: string) => void
	usdFromVes: string
	exchangeRate: number | undefined
	isLoadingRate: boolean
	inputStyles: string
}

export const CurrencyConverter = memo(
	({
		usdValue,
		setUsdValue,
		vesValue,
		vesInputValue,
		setVesInputValue,
		usdFromVes,
		exchangeRate,
		isLoadingRate,
		inputStyles,
	}: CurrencyConverterProps) => {
		// Calculator handlers for both inputs
		const usdCalculatorHandler = createCalculatorInputHandler(parseFloat(usdValue) || 0, (value: number) =>
			setUsdValue(value.toString()),
		)

		const vesCalculatorHandler = createCalculatorInputHandler(parseFloat(vesInputValue) || 0, (value: number) =>
			setVesInputValue(value.toString()),
		)

		return (
			<div className="space-y-3 sm:space-y-4 ">
				<div className="space-y-1.5 sm:space-y-2">
					<FormLabel className="text-sm sm:text-base">Convertidor USD a VES</FormLabel>
					<Input
						type="text"
						inputMode="decimal"
						placeholder="0,00"
						value={usdCalculatorHandler.displayValue}
						onKeyDown={usdCalculatorHandler.handleKeyDown}
						onPaste={usdCalculatorHandler.handlePaste}
						onFocus={usdCalculatorHandler.handleFocus}
						onChange={usdCalculatorHandler.handleChange}
						className={`${inputStyles} text-right font-mono`}
						autoComplete="off"
					/>
					{vesValue && <p className="text-xs sm:text-sm font-bold text-green-600">{vesValue} VES</p>}
				</div>

				<div className="space-y-1.5 sm:space-y-2">
					<FormLabel className="text-sm sm:text-base">Convertidor VES a USD</FormLabel>
					<Input
						type="text"
						inputMode="decimal"
						placeholder="0,00"
						value={vesCalculatorHandler.displayValue}
						onKeyDown={vesCalculatorHandler.handleKeyDown}
						onPaste={vesCalculatorHandler.handlePaste}
						onFocus={vesCalculatorHandler.handleFocus}
						onChange={vesCalculatorHandler.handleChange}
						className={`${inputStyles} text-right font-mono`}
						autoComplete="off"
					/>
					{usdFromVes && <p className="text-xs sm:text-sm font-bold text-green-600">{usdFromVes} USD</p>}
				</div>

				<p className="text-[10px] sm:text-xs text-muted-foreground">
					{isLoadingRate ? 'Cargando tasa...' : `Tasa BCV: ${exchangeRate?.toFixed(2) || 'N/A'} VES/USD`}
				</p>
			</div>
		)
	},
)

CurrencyConverter.displayName = 'CurrencyConverter'