export interface PropsTabNavLink {
	query: string;
	listHref: Array<{title: string; pathname: string; query: string | null}>;
}
