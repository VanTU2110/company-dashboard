import {ArrowDown2} from 'iconsax-react';
import {BiCheck} from 'react-icons/bi';
import {PropsFilterCustom} from './interfaces';
import TippyHeadless from '@tippyjs/react/headless';
import clsx from 'clsx';
import styles from './FilterCustom.module.scss';
import {useRouter} from 'next/router';
import {useState} from 'react';

function FilterCustom({listFilter, name, query}: PropsFilterCustom) {
	const router = useRouter();
	const {[query]: queryStr, ...rest} = router.query;
	const [open, setOpen] = useState<boolean>(false);

	function getNameMethod(arr: {id: number | string; name: string}[], id: number | any) {
		const item = arr?.find((v) => v.id == id);

		return item?.name || 'Tất cả';
	}

	return (
		<TippyHeadless
			maxWidth={'100%'}
			interactive
			visible={open}
			onClickOutside={() => setOpen(false)}
			placement='bottom-start'
			render={(attrs: any) => (
				<div className={styles.mainOption}>
					<div
						className={clsx(styles.option, {
							[styles.option_active]: !queryStr,
						})}
						onClick={() => {
							setOpen(false);
							router.replace(
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
						}}
					>
						<p>{'Tất cả'}</p>
						{!queryStr && (
							<div className={styles.icon_check}>
								<BiCheck fontSize={18} color='#5755FF' fontWeight={600} />
							</div>
						)}
					</div>
					{listFilter?.map((v, i) => (
						<div
							key={i}
							className={clsx(styles.option, {
								[styles.option_active]: queryStr == v.id,
							})}
							onClick={() => {
								setOpen(false);
								router.replace(
									{
										...router,
										query: {
											...router.query,
											[query]: v.id,
										},
									},
									undefined,
									{scroll: false}
								);
							}}
						>
							<p>{v.name}</p>
							{queryStr == v.id && (
								<div className={styles.icon_check}>
									<BiCheck fontSize={18} color='#5755FF' fontWeight={600} />
								</div>
							)}
						</div>
					))}
				</div>
			)}
		>
			<div className={clsx(styles.dealer, {[styles.active]: open})} onClick={() => setOpen(!open)}>
				<div className={styles.value}>
					<p className={styles.name}>{name}:</p>
					<p className={styles.text}>{getNameMethod(listFilter, queryStr)}</p>
				</div>
				<div className={styles.icon_arrow}>
					<ArrowDown2 size={18} color='#3F4752' />
				</div>
			</div>
		</TippyHeadless>
	);
}

export default FilterCustom;
