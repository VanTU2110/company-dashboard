import clsx from 'clsx';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {PropsTabNavLinkActive} from './interface';
import styles from './TabNavLinkActive.module.scss';

function TabNavLinkActive({listHref, query}: PropsTabNavLinkActive) {
	const router = useRouter();
	return (
		<div className={styles.container}>
			{listHref.map((item, i) => (
				<Link
					key={i}
					href={`${item.pathname}${item.query ? `?${query}=${item.query}` : ''}`}
					className={clsx(styles.item, {
						[styles.active]: router.query[`${query}`]
							? router.query[`${query}`] === item.query
							: !item.query,
					})}
				>
					{item.title}
				</Link>
			))}
		</div>
	);
}

export default TabNavLinkActive;
