export interface PropsSelector {
	children: React.ReactNode;
	onChange: (any: any) => void;
	name: string;
	value: any;
	placeholder: string;
	textname?: string;
	valuename?: string;
	label?: string;
	isRequired?: boolean;
	isSearch?: boolean;
}

export interface PropsOption {
	children?: React.ReactNode;
	title: string;
	value: any;
	valuename?: any;
	onClick?: () => void;
}
