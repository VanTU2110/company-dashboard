export interface PropsForm {
	children: React.ReactNode;
	form: any;
	setForm(value: any): void;
	onSubmit?: () => void;
}
