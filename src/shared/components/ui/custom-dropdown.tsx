import { useState, useRef, useEffect, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@shared/lib/cn'

interface DropdownOption {
	value: string
	label: string
	disabled?: boolean
}

interface CustomDropdownProps {
	options: DropdownOption[]
	value?: string
	placeholder?: string
	className?: string
	disabled?: boolean
	onChange?: (value: string) => void
	defaultValue?: string
	direction?: 'auto' | 'up' | 'down'
	dropdownMaxHeight?: number
	'data-testid'?: string
}

const CustomDropdown = forwardRef<HTMLDivElement, CustomDropdownProps>(
	(
		{
			options,
			value,
			placeholder = 'Seleccione una opción',
			className,
			disabled,
			onChange,
			defaultValue,
			direction = 'auto',
			dropdownMaxHeight = 240,
			...props
		},
		ref,
	) => {
		const [isOpen, setIsOpen] = useState(false)
		const [selectedValue, setSelectedValue] = useState(value || defaultValue || '')
		const dropdownRef = useRef<HTMLDivElement>(null)
		const listRef = useRef<HTMLDivElement>(null)
		const [openDirection, setOpenDirection] = useState<'up' | 'down'>('down')
		const [computedMaxHeight, setComputedMaxHeight] = useState<number>(dropdownMaxHeight)

		// Combine refs
		const combinedRef = (node: HTMLDivElement) => {
			dropdownRef.current = node
			if (typeof ref === 'function') {
				ref(node)
			} else if (ref) {
				ref.current = node
			}
		}

		// Close dropdown when clicking outside
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
					setIsOpen(false)
				}
			}

			document.addEventListener('mousedown', handleClickOutside)
			return () => document.removeEventListener('mousedown', handleClickOutside)
		}, [])

		// Handle keyboard navigation
		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if (!isOpen) return

				switch (event.key) {
					case 'Escape':
						setIsOpen(false)
						break
					case 'ArrowDown':
						event.preventDefault()
						// Focus next option
						break
					case 'ArrowUp':
						event.preventDefault()
						// Focus previous option
						break
					case 'Enter':
						event.preventDefault()
						// Select focused option
						break
				}
			}

			document.addEventListener('keydown', handleKeyDown)
			return () => document.removeEventListener('keydown', handleKeyDown)
		}, [isOpen])

		// Sync with external value changes
		useEffect(() => {
			if (value !== undefined) {
				setSelectedValue(value)
			}
		}, [value])

		const computePositioning = () => {
			const node = dropdownRef.current
			if (!node) return
			const rect = node.getBoundingClientRect()
			const viewportH = window.innerHeight || document.documentElement.clientHeight
			const spaceBelow = viewportH - rect.bottom
			const spaceAbove = rect.top

			let nextDirection: 'up' | 'down' = 'down'
			if (direction === 'up' || direction === 'down') {
				nextDirection = direction
			} else {
				// auto
				nextDirection = spaceBelow >= 160 || spaceBelow >= spaceAbove ? 'down' : 'up'
			}

			setOpenDirection(nextDirection)

			const available = nextDirection === 'down' ? spaceBelow - 8 : spaceAbove - 8
			const safeMax = Math.max(120, Math.min(dropdownMaxHeight, available))
			setComputedMaxHeight(safeMax)
		}

		const handleToggle = () => {
			if (disabled) return
			const next = !isOpen
			if (next) computePositioning()
			setIsOpen(next)
		}

		const handleSelect = (optionValue: string) => {
			setSelectedValue(optionValue)
			setIsOpen(false)
			onChange?.(optionValue)
		}

		const selectedOption = options.find((option) => option.value === selectedValue)

		return (
			<div ref={combinedRef} className={cn('relative w-full', className)} {...props}>
				{/* Trigger */}
				<div
					onClick={handleToggle}
					className={cn(
						'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer transition-transform duration-300',
						disabled && 'cursor-not-allowed opacity-50',
						isOpen && 'ring-2 ring-ring ring-offset-2',
					)}
					tabIndex={disabled ? -1 : 0}
					role="combobox"
					aria-expanded={isOpen}
					aria-haspopup="listbox"
				>
					<span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>
						{selectedOption ? selectedOption.label : placeholder}
					</span>
					<ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform duration-200', isOpen && 'rotate-180')} />
				</div>

				{/* Dropdown Content */}
				{isOpen && (
					<div
						ref={listRef}
						className={cn(
							'absolute z-[100] w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 duration-200',
							openDirection === 'down' ? 'top-full mt-1' : 'bottom-full mb-1',
						)}
						style={{ maxHeight: computedMaxHeight }}
						role="listbox"
					>
						{options.length === 0 ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">No hay opciones disponibles</div>
						) : (
							options.map((option) => (
								<div
									key={option.value}
									onClick={() => !option.disabled && handleSelect(option.value)}
									className={cn(
										'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none transition-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
										option.disabled && 'pointer-events-none opacity-50',
										selectedValue === option.value && 'bg-accent text-accent-foreground',
									)}
									role="option"
									aria-selected={selectedValue === option.value}
								>
									<span className={cn(selectedValue === option.value && '')}>{option.label}</span>
								</div>
							))
						)}
					</div>
				)}
			</div>
		)
	},
)

CustomDropdown.displayName = 'CustomDropdown'

export { CustomDropdown }
export type { DropdownOption, CustomDropdownProps }
