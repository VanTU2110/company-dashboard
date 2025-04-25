export interface PropsInputForm {
	name: string;
	placeholder: string;
	type?: string;
	label?: string | React.ReactNode;
	iconInput?: React.ReactNode;
	showDone?: boolean;
	onClean?: boolean;
	isRequired?: boolean;
	textRequired?: string;
	valueConfirm?: any;
	textConfirm?: string;
	isNumber?: boolean;
	isDisabled?: boolean;
	isEmail?: boolean;
	isPhone?: boolean;
	min?: number;
	max?: number;
	[props: string]: any;
}

export interface PropsContextForm {
	form: any;
	validate: any;
	errorText: any;
	isDone: boolean;
	countValidate: any;
	setForm: (any: any) => void;
	setValidate: (any: any) => void;
	setErrorText: (any: any) => void;
	setCountValidate: (any: any) => void;
}
