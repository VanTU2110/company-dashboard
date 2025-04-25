import {PropsTabNavLinkIcon} from './interface';
import clsx from 'clsx';
import styles from './TabNavLinkIcon.module.scss';
import {useRouter} from 'next/router';

function TabNavLinkIcon({listType, query}: PropsTabNavLinkIcon) {
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
			{listType.map((v, i) => (
				<div
					key={i}
					className={clsx(styles.item_tab, {
						[styles.active]: router.query[`${query}`] ? router.query[`${query}`] === v.query : !v.query,
					})}
					onClick={() => handleActive(v.query)}
				>
					{v.icon && (
						<div className={styles.box_icon}>
							<v.icon size={20} className={styles.icon} />
						</div>
					)}
					<p className={styles.text}>
						{v.title} <span>{v.qlt ? `(${v.qlt})` : null}</span>
					</p>
				</div>
			))}
		</div>
	);
}

export default TabNavLinkIcon;
