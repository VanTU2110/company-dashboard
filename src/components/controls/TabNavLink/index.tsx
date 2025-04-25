import Link from 'next/link';
import {PropsTabNavLink} from './interface';
import clsx from 'clsx';
import styles from './TabNavLink.module.scss';
import {useRouter} from 'next/router';

function TabNavLink({listHref, query}: PropsTabNavLink) {
	const router = useRouter();

	const handleActive = (value: string | null) => {
		const {[query]: str, ...rest} = router.query;

		if (value == null) {
			return router.replace(
				{
					query: {
						...rest,
					},
				},
				undefined,
				{
					scroll: false,
				}
			);
		}

		return router.replace(
			{
				query: {
					...router.query,
					[query]: value,
				},
			},
			undefined,
			{
				scroll: false,
			}
		);
	};
	return (
		<div className={styles.container}>
			{listHref.map((item, i) => (
				<div
					className={clsx(styles.item, {
						[styles.active]: router.query[`${query}`]
							? router.query[`${query}`] === item.query
							: !item.query,
					})}
					key={i}
					onClick={() => handleActive(item.query)}
				>
					{item.title}
				</div>
			))}
		</div>
	);
}

export default TabNavLink;
