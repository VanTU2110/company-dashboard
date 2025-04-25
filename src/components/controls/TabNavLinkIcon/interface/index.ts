export interface PropsTabNavLinkIcon {
	query: string;
	listType: Array<{
		title: string;
		pathname: string;
		query: string | null;
		icon?: any;
		qlt?: number;
	}>;
}
